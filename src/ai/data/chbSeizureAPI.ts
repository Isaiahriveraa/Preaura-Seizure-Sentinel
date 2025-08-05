/**
 * CHB-MIT Seizure API - Fetch seizure timing from PhysioNet
 * 
 * Purpose: Get seizure annotations directly from official CHB-MIT database
 * Learning Focus: Using public medical APIs for AI training labels
 */

import { CHB_SEIZURE_DATABASE, getSeizuresForCase } from './chbSeizureData';

interface SeizureEvent {
  fileName: string;
  seizureNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
}

interface CHBCaseSeizures {
  caseId: string;
  totalSeizures: number;
  seizureEvents: SeizureEvent[];
  files: string[];
}

export class CHBSeizureAPI {
  private static readonly BASE_URL = "https://physionet.org/content/chbmit/1.0.0/";
  
  /**
   * Fetch seizure timing for a specific CHB case (e.g., "chb01")
   */
  static async fetchSeizureData(caseId: string): Promise<CHBCaseSeizures> {
    console.log(`🔍 Fetching seizure data for ${caseId} from PhysioNet...`);
    
    try {
      // Try multiple approaches to get around CORS
      const seizureEvents = await this.fetchWithCORSWorkaround(caseId);
      
      // Validate the results
      if (seizureEvents.length === 0 || seizureEvents.some(e => isNaN(e.startTime) || isNaN(e.endTime))) {
        console.log(`⚠️ API returned invalid data, falling back to local database`);
        return this.getLocalSeizureData(caseId);
      }
      
      console.log(`✅ Found ${seizureEvents.length} seizures for ${caseId} from API`);
      
      return {
        caseId,
        totalSeizures: seizureEvents.length,
        seizureEvents,
        files: [...new Set(seizureEvents.map(s => s.fileName))]
      };
      
    } catch (error) {
      console.log(`❌ API fetch failed: ${error}`);
      console.log(`📚 Using reliable local seizure database instead...`);
      // Fall back to local seizure database (same data as your Python script)
      return this.getLocalSeizureData(caseId);
    }
  }

  /**
   * Try different methods to fetch data around CORS restrictions
   */
  private static async fetchWithCORSWorkaround(caseId: string): Promise<SeizureEvent[]> {
    const summaryUrl = `${this.BASE_URL}${caseId}/${caseId}-summary.txt`;
    
    // Method 1: Try direct fetch (works if CORS is allowed)
    try {
      console.log(`📡 Trying direct fetch: ${summaryUrl}`);
      const response = await fetch(summaryUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'text/plain',
        }
      });
      
      if (response.ok) {
        const summaryText = await response.text();
        const parsedEvents = this.parseSummaryText(summaryText);
        
        // Validate parsed events
        if (parsedEvents.length > 0 && parsedEvents.every(e => !isNaN(e.startTime) && !isNaN(e.endTime))) {
          console.log(`✅ Successfully parsed ${parsedEvents.length} seizures from API`);
          return parsedEvents;
        } else {
          console.log(`⚠️ API parsing failed or returned invalid data`);
        }
      }
    } catch (error) {
      console.log(`⚠️ Direct fetch failed: ${error}`);
    }

    // Method 2: Try CORS proxy (if available)
    try {
      console.log(`📡 Trying CORS proxy...`);
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(summaryUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const summaryText = await response.text();
        const parsedEvents = this.parseSummaryText(summaryText);
        
        // Validate parsed events
        if (parsedEvents.length > 0 && parsedEvents.every(e => !isNaN(e.startTime) && !isNaN(e.endTime))) {
          console.log(`✅ Successfully parsed ${parsedEvents.length} seizures from proxy`);
          return parsedEvents;
        }
      }
    } catch (error) {
      console.log(`⚠️ CORS proxy failed: ${error}`);
    }

    // If all API methods fail, throw error to trigger local fallback
    throw new Error('All API methods failed - using local database');
  }

  /**
   * Get seizure data from local database (same data as your Python script)
   */
   private static getLocalSeizureData(caseId: string): CHBCaseSeizures {
    console.log(`📚 Using local seizure database for ${caseId}...`);
    
    const localRecords = getSeizuresForCase(caseId);
    
    const seizureEvents: SeizureEvent[] = localRecords.map(record => ({
      fileName: record.fileName,
      seizureNumber: record.seizureNumber,
      startTime: record.startTime,
      endTime: record.endTime,
      duration: record.duration
    }));

    console.log(`✅ Found ${seizureEvents.length} seizures in local database for ${caseId}`);
    console.log(`📊 This is the SAME data your Python script would fetch!`);

    return {
      caseId,
      totalSeizures: seizureEvents.length,
      seizureEvents,
      files: [...new Set(seizureEvents.map(s => s.fileName))]
    };
  }

  /**
   * Create demo seizure data with realistic patterns when API fails
   */
  private static createDemoSeizureData(caseId: string): CHBCaseSeizures {
    console.log(`🎭 Creating demo seizure data for ${caseId}...`);
    
    // Demo data based on real CHB-MIT patterns
    const demoPatterns: Record<string, SeizureEvent[]> = {
      'chb01': [
        { fileName: 'chb01_03.edf', seizureNumber: 1, startTime: 2996, endTime: 3036, duration: 40 }
      ],
      'chb02': [
        { fileName: 'chb02_16.edf', seizureNumber: 1, startTime: 130, endTime: 212, duration: 82 },
        { fileName: 'chb02_16.edf', seizureNumber: 2, startTime: 2972, endTime: 3053, duration: 81 }
      ],
      'chb03': [
        { fileName: 'chb03_01.edf', seizureNumber: 1, startTime: 362, endTime: 414, duration: 52 }
      ]
    };

    const seizureEvents = demoPatterns[caseId] || [
      { fileName: `${caseId}_03.edf`, seizureNumber: 1, startTime: 1800, endTime: 1860, duration: 60 }
    ];

    console.log(`✅ Created demo data: ${seizureEvents.length} seizures for ${caseId}`);

    return {
      caseId,
      totalSeizures: seizureEvents.length,
      seizureEvents,
      files: [...new Set(seizureEvents.map(s => s.fileName))]
    };
  }
  
  /**
   * Parse CHB-MIT summary text to extract seizure timing
   */
  private static parseSummaryText(summaryText: string): SeizureEvent[] {
    console.log('📋 Parsing CHB-MIT summary text...');
    console.log('🔍 Raw text preview:', summaryText.substring(0, 500));
    
    const lines = summaryText.split('\n');
    const seizureEvents: SeizureEvent[] = [];
    
    let currentFileName: string | null = null;
    let seizureCount = 0;
    let pendingSeizure: Partial<SeizureEvent> | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      console.log(`📝 Processing line: "${trimmedLine}"`);
      
      if (trimmedLine.startsWith('File Name:')) {
        currentFileName = trimmedLine.split(':')[1].trim();
        seizureCount = 0;
        console.log(`   📁 Processing file: ${currentFileName}`);
      }
      else if (trimmedLine.startsWith('Seizure Start Time:')) {
        if (currentFileName) {
          // More robust parsing - extract the number before 'seconds'
          const timeMatch = trimmedLine.match(/(\d+)\s*seconds?/i);
          if (timeMatch) {
            const startTime = parseInt(timeMatch[1]);
            seizureCount++;
            
            pendingSeizure = {
              fileName: currentFileName,
              seizureNumber: seizureCount,
              startTime: startTime
            };
            
            console.log(`   🚨 Seizure ${seizureCount} starts at ${startTime}s (parsed from: "${trimmedLine}")`);
          } else {
            console.log(`   ❌ Could not parse start time from: "${trimmedLine}"`);
          }
        }
      }
      else if (trimmedLine.startsWith('Seizure End Time:')) {
        if (pendingSeizure) {
          // More robust parsing - extract the number before 'seconds'
          const timeMatch = trimmedLine.match(/(\d+)\s*seconds?/i);
          if (timeMatch) {
            const endTime = parseInt(timeMatch[1]);
            const duration = endTime - pendingSeizure.startTime!;
            
            const completeSeizure: SeizureEvent = {
              fileName: pendingSeizure.fileName!,
              seizureNumber: pendingSeizure.seizureNumber!,
              startTime: pendingSeizure.startTime!,
              endTime: endTime,
              duration: duration
            };
            
            seizureEvents.push(completeSeizure);
            console.log(`   ⏹️  Seizure ${pendingSeizure.seizureNumber} ends at ${endTime}s (${duration}s duration) (parsed from: "${trimmedLine}")`);
            
            pendingSeizure = null;
          } else {
            console.log(`   ❌ Could not parse end time from: "${trimmedLine}"`);
          }
        }
      }
    }
    
    console.log(`📊 Parsed ${seizureEvents.length} complete seizure events`);
    if (seizureEvents.length === 0) {
      console.log(`⚠️ No seizures found in summary text - falling back to local database`);
    }
    return seizureEvents;
  }
  
  /**
   * Get seizure labels for a specific time window in EEG data
   */
  static generateSeizureLabels(
    seizureEvents: SeizureEvent[], 
    fileName: string, 
    timePoints: number, 
    samplingRate: number = 256
  ): number[] {
    console.log(`🏷️  Generating seizure labels for ${fileName} (${timePoints} time points)`);
    
    // Create label array: 0 = normal, 1 = seizure
    const labels = new Array(timePoints).fill(0);
    
    // Find seizures in this specific file
    const fileSeizures = seizureEvents.filter(s => s.fileName === fileName);
    
    for (const seizure of fileSeizures) {
      const startSample = Math.floor(seizure.startTime * samplingRate);
      const endSample = Math.floor(seizure.endTime * samplingRate);
      
      // Mark seizure samples as 1
      for (let i = startSample; i < Math.min(endSample, timePoints); i++) {
        if (i >= 0) {
          labels[i] = 1;
        }
      }
      
      console.log(`   🔴 Labeled samples ${startSample}-${endSample} as seizure`);
    }
    
    const seizureSamples = labels.filter(l => l === 1).length;
    const normalSamples = labels.filter(l => l === 0).length;
    
    console.log(`📊 Generated labels: ${seizureSamples} seizure samples, ${normalSamples} normal samples`);
    
    return labels;
  }
  
  /**
   * Check if EEG data sample contains seizure activity
   */
  static isSeizureInTimeWindow(
    seizureEvents: SeizureEvent[],
    fileName: string,
    startTime: number,
    endTime: number
  ): boolean {
    const fileSeizures = seizureEvents.filter(s => s.fileName === fileName);
    
    return fileSeizures.some(seizure => 
      // Check if seizure overlaps with time window
      seizure.startTime < endTime && seizure.endTime > startTime
    );
  }
  
  /**
   * Convert to AI training format
   */
  static convertToAIFormat(seizureData: CHBCaseSeizures): any {
    return {
      patient: seizureData.caseId,
      seizureCount: seizureData.totalSeizures,
      trainingLabels: seizureData.seizureEvents.map(event => ({
        file: event.fileName,
        startSample: event.startTime * 256, // Convert to sample index
        endSample: event.endTime * 256,
        duration: event.duration,
        label: 1 // Seizure label
      }))
    };
  }
}
