import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Upload, 
  BarChart3, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  Wifi,
  WifiOff,
  Download,
  Presentation
} from 'lucide-react';
import { CHBDatabaseService } from '../data/chbDatabaseService';
import { getSeizureStats } from '../data/chbSeizureData';

interface DatabaseStats {
  totalSeizures: number;
  uniquePatients: number;
  avgDuration: number;
  completedCases: number;
  databaseConnected: boolean;
}

export const DatabaseTester: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [localStats] = useState(getSeizureStats());
  const [failedRecords, setFailedRecords] = useState<any[]>([]);

  // Load initial stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const dbStats = await CHBDatabaseService.getDatabaseStats();
      setStats(dbStats);
      if (dbStats?.databaseConnected) {
        setMessage('✅ Database connected - Using PostgreSQL data');
        setMessageType('success');
      } else {
        setMessage('🔄 Database offline - Using TypeScript fallback data (Perfect for presentations!)');
        setMessageType('info');
      }
    } catch (error) {
      setMessage(`🔄 Using TypeScript fallback data - ${localStats.totalSeizures} seizures available`);
      setMessageType('info');
    } finally {
      setLoading(false);
    }
  };

  const loadCHBData = async () => {
    setLoadingData(true);
    setMessage('📊 Loading CHB-MIT dataset to database...');
    setMessageType('info');
    setFailedRecords([]); // Clear previous failed records

    try {
      const result = await CHBDatabaseService.loadCHBDataToDatabase();
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        
        // Store failed records for display
        if (result.stats?.failedRecords) {
          setFailedRecords(result.stats.failedRecords);
        }
        
        // Refresh stats
        await loadStats();
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Load failed: ${error}`);
      setMessageType('error');
    } finally {
      setLoadingData(false);
    }
  };

  const downloadPresentationGuide = () => {
    const guide = [
      '# PreAura Seizure Sentinel - Presentation Setup Guide',
      '',
      '## 🎯 Perfect for Presentations!',
      '',
      '### Your Friend\'s Setup (Zero Database Required):',
      '1. Clone repository: `git clone [repo-url]`',
      '2. Install dependencies: `npm install`',
      '3. Start development server: `npm run dev`',
      '4. Access at: http://localhost:5173',
      '',
      '### Available Data (No Database Needed):',
      `- Total Seizures: ${localStats.totalSeizures}`,
      `- Total Patients: ${localStats.totalPatients}`,
      `- Average Duration: ${localStats.avgDuration}s`,
      `- Data Source: CHB-MIT TypeScript Database`,
      '',
      '### Features Available:',
      '✅ Complete seizure prediction dashboard',
      '✅ EEG visualization and analysis',
      '✅ Bulk seizure data collection',
      '✅ AI training data access',
      '✅ Real CHB-MIT pediatric epilepsy data',
      '✅ Works offline (perfect for demos)',
      '',
      '### Why This Works:',
      '- Smart fallback system automatically uses TypeScript data when database unavailable',
      '- No network dependencies during presentation',
      '- Instant startup and blazing fast performance',
      '- Same features and data as database version',
      '',
      '### For Developers:',
      '- Database setup only needed for persistent storage and SQL queries',
      '- Presentation mode automatically uses local TypeScript data',
      '- Hybrid approach: Database when available, fallback when not',
      '',
      '🚀 Ready to present!'
    ].join('\n');

    const blob = new Blob([guide], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation_setup_guide.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-green-600" />
            PreAura Database & Presentation Tester
          </CardTitle>
          <CardDescription>
            Perfect setup for presentations - works with or without database!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status Message */}
          {message && (
            <Alert className={
              messageType === 'success' ? 'border-green-200 bg-green-50' :
              messageType === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              {messageType === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
               messageType === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
               <Clock className="h-4 w-4 text-blue-600" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={loadStats} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {loading ? 'Loading...' : 'Check Status'}
            </Button>

            <Button 
              onClick={loadCHBData} 
              disabled={loadingData}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loadingData ? 'Loading Dataset...' : 'Load CHB Data'}
            </Button>

            <Button 
              onClick={downloadPresentationGuide} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Setup Guide
            </Button>
          </div>

          {/* Loading Progress */}
          {loadingData && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loading CHB-MIT dataset...</span>
                <span>Processing...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

        </CardContent>
      </Card>

      {/* Data Availability Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Database Stats */}
        <Card className={`${stats?.databaseConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats?.databaseConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-gray-400" />
              )}
              Database Mode
            </CardTitle>
            <CardDescription>
              {stats?.databaseConnected ? 'PostgreSQL database active' : 'Database not available'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.databaseConnected ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Seizures:</span>
                  <span className="font-bold">{stats.totalSeizures}</span>
                </div>
                <div className="flex justify-between">
                  <span>Patients:</span>
                  <span className="font-bold">{stats.uniquePatients}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Duration:</span>
                  <span className="font-bold">{stats.avgDuration}s</span>
                </div>
                <Badge className="w-full justify-center">Connected</Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Database Offline</p>
                <p className="text-xs text-gray-500">Using fallback data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TypeScript Fallback Stats */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Presentation Mode
            </CardTitle>
            <CardDescription>
              TypeScript fallback data (Perfect for demos!)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Seizures:</span>
                <span className="font-bold">{localStats.totalSeizures}</span>
              </div>
              <div className="flex justify-between">
                <span>Patients:</span>
                <span className="font-bold">{localStats.totalPatients}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span className="font-bold">{localStats.avgDuration}s</span>
              </div>
              <Badge variant="secondary" className="w-full justify-center">Always Available</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Presentation Info */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-6 w-6 text-yellow-600" />
            🎯 Perfect Setup for Presentations!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">👨‍💻 Your Development Setup:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✅ Database + TypeScript fallback</li>
                  <li>✅ SQL queries and persistence</li>
                  <li>✅ Real-time data updates</li>
                  <li>✅ Advanced analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">🎤 Friend's Presentation Setup:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✅ TypeScript fallback only</li>
                  <li>✅ Zero setup required</li>
                  <li>✅ Works offline</li>
                  <li>✅ Same features & data</li>
                </ul>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-100 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>💡 Smart Design:</strong> Your app automatically uses TypeScript data when the database isn't available. 
                This means your friend gets the exact same experience with {localStats.totalSeizures} seizures from {localStats.totalPatients} patients, 
                but without any setup complexity!
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={downloadPresentationGuide}
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Setup Guide
              </Button>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Ready for Presentation
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Records Analysis */}
      {failedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              🔍 Failed Records Analysis ({failedRecords.length} failures)
            </CardTitle>
            <CardDescription>
              Detailed breakdown of which seizure records failed to load
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Investigation Results:</strong> Found {failedRecords.length} seizure records that failed to load into the database.
                  This helps us understand data quality and improve the loading process.
                </p>
              </div>
              
              <div className="grid gap-2">
                {failedRecords.map((record, index) => (
                  <div key={index} className="p-3 border border-red-200 rounded-md bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-semibold">
                          {record.case_id} - {record.file_name} - Seizure #{record.seizure_number}
                        </span>
                        <div className="text-xs text-gray-600">
                          Duration: {record.duration}s | Start: {record.start_time}s | End: {record.end_time}s
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Record #{record.index}
                      </Badge>
                    </div>
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800">
                      Error: {record.error}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>🧠 Learning Insight:</strong> Failed records help identify edge cases in medical data. 
                  Common issues include data validation errors, duplicate constraints, or unusual timing patterns.
                  This is valuable for improving data quality checks in production medical AI systems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabaseTester;
