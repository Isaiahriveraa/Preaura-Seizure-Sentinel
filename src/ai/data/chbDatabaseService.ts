/**
 * CHB-MIT Database Service - Store seizure data in PostgreSQL
 * 
 * Purpose: Persist seizure data with database features (queries, deduplication, etc.)
 * Learning Focus: Database integration for medical AI data
 */

import { createClient } from '@supabase/supabase-js';
import { CHB_SEIZURE_DATABASE, getSeizuresForCase } from './chbSeizureData';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log(`🔌 Connecting to Supabase: ${supabaseUrl}`);

// Create a raw Supabase client for CHB data (bypasses type restrictions)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'chb-database-service'
    }
  }
});

// Test database connection and auth status
const testConnection = async () => {
  try {
    // Test the connection using our new function
    const { data, error } = await supabase.rpc('get_chb_count');
    if (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
    } else {
      console.log(`✅ Database connection successful - Current seizure count: ${data}`);
    }
  } catch (error) {
    console.log(`❌ Connection test error: ${error}`);
  }
};

// Run connection test
testConnection();

export interface DatabaseSeizureRecord {
  id?: string;
  case_id: string;
  file_name: string;
  seizure_number: number;
  start_time: number;
  end_time: number;
  duration: number;
  start_sample: number;
  end_sample: number;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionStatus {
  id?: string;
  case_id: string;
  total_seizures: number;
  total_files: number;
  collection_date?: string;
  status: 'pending' | 'collected' | 'error';
  error_message?: string;
  api_source: 'api' | 'local' | 'manual';
}

export class CHBDatabaseService {
  
  /**
   * Store a single seizure record in database using secure function
   */
  static async storeSeizureRecord(record: Omit<DatabaseSeizureRecord, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`💾 Storing seizure: ${record.case_id} - ${record.file_name} - Seizure #${record.seizure_number}`);
      console.log(`📊 Record details:`, record);
      
      // Use the secure function that bypasses RLS
      const { data, error } = await supabase.rpc('insert_chb_seizure', {
        p_case_id: record.case_id,
        p_file_name: record.file_name,
        p_seizure_number: record.seizure_number,
        p_start_time: record.start_time,
        p_end_time: record.end_time,
        p_duration: record.duration,
        p_start_sample: record.start_sample,
        p_end_sample: record.end_sample
      });

      if (error) {
        console.log(`❌ Database error: ${error.message}`);
        console.log(`❌ Full error:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Stored seizure successfully, ID: ${data}`);
      return { success: true };
      
    } catch (error) {
      console.log(`❌ Store error: ${error}`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Store multiple seizure records in batch using individual function calls
   */
  static async storeSeizuresBatch(records: Omit<DatabaseSeizureRecord, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ success: boolean; stored: number; errors: number; failedRecords: any[] }> {
    console.log(`💾 Batch storing ${records.length} seizure records using secure functions...`);
    
    let stored = 0;
    let errors = 0;
    const failedRecords: any[] = [];

    // Process each record individually using the secure function
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`🔄 Processing ${i + 1}/${records.length}: ${record.case_id} - ${record.file_name} - Seizure #${record.seizure_number}`);
      
      const result = await this.storeSeizureRecord(record);
      if (result.success) {
        stored++;
        console.log(`✅ SUCCESS: ${record.case_id} - ${record.file_name} - Seizure #${record.seizure_number}`);
      } else {
        errors++;
        const failedRecord = {
          ...record,
          error: result.error,
          index: i + 1
        };
        failedRecords.push(failedRecord);
        console.log(`❌ FAILED ${i + 1}: ${record.case_id} - ${record.file_name} - Seizure #${record.seizure_number}`);
        console.log(`❌ ERROR: ${result.error}`);
      }
    }

    console.log(`📊 Batch complete: ${stored} stored, ${errors} errors`);
    if (failedRecords.length > 0) {
      console.log(`🔍 FAILED RECORDS SUMMARY:`);
      failedRecords.forEach((record, idx) => {
        console.log(`${idx + 1}. ${record.case_id} - ${record.file_name} - Seizure #${record.seizure_number} | Error: ${record.error}`);
      });
    }
    
    return { success: stored > 0, stored, errors, failedRecords };
  }

  /**
   * Load all CHB seizure data into database
   */
  static async loadCHBDataToDatabase(): Promise<{ success: boolean; message: string; stats: any }> {
    console.log(`🚀 Loading complete CHB-MIT dataset to database...`);
    console.log(`📊 Source: ${CHB_SEIZURE_DATABASE.length} seizure records`);

    try {
      // Convert TypeScript data to database format
      const dbRecords: Omit<DatabaseSeizureRecord, 'id' | 'created_at' | 'updated_at'>[] = CHB_SEIZURE_DATABASE.map((record, index) => {
        console.log(`🔄 Converting record ${index + 1}: ${record.caseId} - ${record.fileName} - Seizure #${record.seizureNumber}`);
        return {
          case_id: record.caseId,
          file_name: record.fileName,
          seizure_number: record.seizureNumber,
          start_time: record.startTime,
          end_time: record.endTime,
          duration: record.duration,
          start_sample: record.startTime * 256, // 256 Hz sampling rate
          end_sample: record.endTime * 256
        };
      });

      console.log(`✅ Converted ${dbRecords.length} records, starting database insertion...`);

      // Store in database
      const result = await this.storeSeizuresBatch(dbRecords);
      
      // Update collection status for each case (simplified)
      const cases = [...new Set(CHB_SEIZURE_DATABASE.map(r => r.caseId))];
      for (const caseId of cases) {
        await this.updateCollectionStatus({
          case_id: caseId,
          total_seizures: CHB_SEIZURE_DATABASE.filter(r => r.caseId === caseId).length,
          total_files: [...new Set(CHB_SEIZURE_DATABASE.filter(r => r.caseId === caseId).map(r => r.fileName))].length,
          status: 'collected',
          api_source: 'local'
        });
      }

      const message = `✅ Database loaded: ${result.stored} seizures stored, ${result.errors} errors`;
      console.log(message);

      // Log failed records summary
      if (result.failedRecords && result.failedRecords.length > 0) {
        console.log(`\n🔍 DETAILED FAILURE ANALYSIS:`);
        const groupedFailures = result.failedRecords.reduce((acc, record) => {
          const key = record.error || 'Unknown Error';
          if (!acc[key]) acc[key] = [];
          acc[key].push(`${record.case_id} - ${record.file_name} - Seizure #${record.seizure_number}`);
          return acc;
        }, {} as Record<string, string[]>);

        Object.entries(groupedFailures).forEach(([error, records]) => {
          console.log(`\n❌ Error: "${error}"`);
          console.log(`   Affected records: ${records.length}`);
          records.forEach(record => console.log(`   - ${record}`));
        });
      }

      return {
        success: result.success,
        message,
        stats: {
          totalRecords: CHB_SEIZURE_DATABASE.length,
          stored: result.stored,
          errors: result.errors,
          patients: cases.length,
          failedRecords: result.failedRecords || []
        }
      };

    } catch (error) {
      const message = `❌ Failed to load CHB data: ${error}`;
      console.log(message);
      return { success: false, message, stats: {} };
    }
  }

  /**
   * Get seizures for a specific case from database
   */
  static async getSeizuresFromDatabase(caseId: string): Promise<DatabaseSeizureRecord[]> {
    try {
      console.log(`🔍 Fetching ${caseId} seizures from database...`);
      
      const { data, error } = await supabase
        .from('chb_seizure_events')
        .select('*')
        .eq('case_id', caseId)
        .order('seizure_number');

      if (error) {
        console.log(`❌ Database query error: ${error.message}`);
        return [];
      }

      console.log(`✅ Found ${data.length} seizures for ${caseId} in database`);
      return data;
      
    } catch (error) {
      console.log(`❌ Query error: ${error}`);
      return [];
    }
  }

  /**
   * Get all seizures from database
   */
  static async getAllSeizuresFromDatabase(): Promise<DatabaseSeizureRecord[]> {
    try {
      console.log(`🔍 Fetching all seizures from database...`);
      
      const { data, error } = await supabase
        .from('chb_seizure_events')
        .select('*')
        .order('case_id, seizure_number');

      if (error) {
        console.log(`❌ Database query error: ${error.message}`);
        return [];
      }

      console.log(`✅ Found ${data.length} total seizures in database`);
      return data;
      
    } catch (error) {
      console.log(`❌ Query error: ${error}`);
      return [];
    }
  }

  /**
   * Update collection status for a case (simplified version)
   */
  static async updateCollectionStatus(status: Omit<CollectionStatus, 'id' | 'collection_date'>): Promise<void> {
    try {
      console.log(`📊 Updating collection status for ${status.case_id}`);
      // Skip collection status for now to focus on seizure data
      // This can be re-enabled once the main data loading works
    } catch (error) {
      console.log(`❌ Status update failed: ${error}`);
    }
  }

  /**
   * Get database statistics using secure function
   */
  static async getDatabaseStats(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_chb_stats');

      if (error) {
        console.log(`❌ Stats query error: ${error.message}`);
        return { databaseConnected: false };
      }

      console.log(`✅ Database stats retrieved:`, data);
      return data;
      
    } catch (error) {
      console.log(`❌ Stats error: ${error}`);
      return { databaseConnected: false };
    }
  }

  /**
   * Smart seizure fetcher - tries database first, falls back to local data
   */
  static async getSeizures(caseId: string): Promise<any[]> {
    // Try database first
    const dbSeizures = await this.getSeizuresFromDatabase(caseId);
    
    if (dbSeizures.length > 0) {
      console.log(`✅ Using database data for ${caseId}`);
      return dbSeizures.map(s => ({
        fileName: s.file_name,
        seizureNumber: s.seizure_number,
        startTime: s.start_time,
        endTime: s.end_time,
        duration: s.duration
      }));
    }

    // Fallback to local data
    console.log(`📚 Using local data for ${caseId}`);
    return getSeizuresForCase(caseId).map(s => ({
      fileName: s.fileName,
      seizureNumber: s.seizureNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration
    }));
  }
}
