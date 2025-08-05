import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Brain, Zap, Clock, FileText, Download, Database } from 'lucide-react';
import { CHBSeizureAPI } from '../data/chbSeizureAPI';
import { getSeizureStats, getAllCases } from '../data/chbSeizureData';

interface BulkSeizureData {
  [caseId: string]: {
    caseId: string;
    totalSeizures: number;
    seizureEvents: any[];
    files: string[];
    status: 'pending' | 'loading' | 'success' | 'error';
    error?: string;
  };
}

export const BulkSeizureCollector: React.FC = () => {
  const [bulkData, setBulkData] = useState<BulkSeizureData>({});
  const [isCollecting, setIsCollecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCase, setCurrentCase] = useState<string>('');

  const allCases = Array.from({length: 24}, (_, i) => `chb${String(i + 1).padStart(2, '0')}`);
  const stats = getSeizureStats();

  const collectAllSeizureData = async () => {
    setIsCollecting(true);
    setProgress(0);
    setBulkData({});

    const newBulkData: BulkSeizureData = {};
    
    // Initialize all cases
    allCases.forEach(caseId => {
      newBulkData[caseId] = {
        caseId,
        totalSeizures: 0,
        seizureEvents: [],
        files: [],
        status: 'pending'
      };
    });
    setBulkData({...newBulkData});

    // Collect data for each case
    for (let i = 0; i < allCases.length; i++) {
      const caseId = allCases[i];
      setCurrentCase(caseId);
      
      try {
        // Update status to loading
        newBulkData[caseId].status = 'loading';
        setBulkData({...newBulkData});

        console.log(`🔍 Collecting ${caseId}... (${i + 1}/${allCases.length})`);
        
        const seizureData = await CHBSeizureAPI.fetchSeizureData(caseId);
        
        newBulkData[caseId] = {
          ...seizureData,
          status: 'success'
        };

        console.log(`✅ ${caseId}: ${seizureData.totalSeizures} seizures`);
        
      } catch (error) {
        console.log(`❌ ${caseId} failed: ${error}`);
        newBulkData[caseId].status = 'error';
        newBulkData[caseId].error = error instanceof Error ? error.message : 'Unknown error';
      }

      // Update progress
      const progressPercent = ((i + 1) / allCases.length) * 100;
      setProgress(progressPercent);
      setBulkData({...newBulkData});

      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsCollecting(false);
    setCurrentCase('');
    console.log('🎉 Bulk collection completed!');
  };

  const downloadDataset = () => {
    const allSeizures = Object.values(bulkData)
      .filter(data => data.status === 'success')
      .flatMap(data => 
        data.seizureEvents.map(seizure => ({
          patient: data.caseId,
          file: seizure.fileName,
          seizure_number: seizure.seizureNumber,
          start_time: seizure.startTime,
          end_time: seizure.endTime,
          duration: seizure.duration,
          start_sample: seizure.startTime * 256, // 256 Hz sampling
          end_sample: seizure.endTime * 256,
          label: 1 // Seizure label for AI training
        }))
      );

    const csvContent = [
      'patient,file,seizure_number,start_time,end_time,duration,start_sample,end_sample,label',
      ...allSeizures.map(row => 
        `${row.patient},${row.file},${row.seizure_number},${row.start_time},${row.end_time},${row.duration},${row.start_sample},${row.end_sample},${row.label}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chb_mit_seizure_dataset.csv';
    a.click();
    URL.revokeObjectURL(url);

    console.log(`📊 Downloaded dataset: ${allSeizures.length} seizures from ${Object.keys(bulkData).filter(k => bulkData[k].status === 'success').length} patients`);
  };

  const completedCases = Object.values(bulkData).filter(d => d.status === 'success').length;
  const totalSeizures = Object.values(bulkData)
    .filter(d => d.status === 'success')
    .reduce((sum, d) => sum + d.totalSeizures, 0);
  const errorCases = Object.values(bulkData).filter(d => d.status === 'error').length;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            CHB-MIT Bulk Seizure Collector
          </CardTitle>
          <CardDescription>
            Collect seizure timing data from all 24 CHB-MIT patients for complete AI training dataset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Current Database Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-md">
            <div>
              <span className="text-sm font-medium">Local Database</span>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPatients} patients</p>
            </div>
            <div>
              <span className="text-sm font-medium">Total Seizures</span>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSeizures}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Avg Duration</span>
              <p className="text-2xl font-bold text-blue-600">{stats.avgDuration}s</p>
            </div>
            <div>
              <span className="text-sm font-medium">Range</span>
              <p className="text-2xl font-bold text-blue-600">{stats.shortestSeizure}-{stats.longestSeizure}s</p>
            </div>
          </div>

          {/* Collection Controls */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={collectAllSeizureData} 
              disabled={isCollecting}
              className="flex items-center gap-2"
            >
              {isCollecting ? (
                <>⏳ Collecting...</>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Collect All 24 Patients
                </>
              )}
            </Button>

            {completedCases > 0 && (
              <Button 
                onClick={downloadDataset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Dataset CSV
              </Button>
            )}
          </div>

          {/* Progress */}
          {isCollecting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collecting {currentCase}...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Results Summary */}
          {completedCases > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-md">
              <div>
                <span className="text-sm font-medium">Collected</span>
                <p className="text-2xl font-bold text-green-600">{completedCases}/24 patients</p>
              </div>
              <div>
                <span className="text-sm font-medium">Total Seizures</span>
                <p className="text-2xl font-bold text-green-600">{totalSeizures}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Errors</span>
                <p className="text-2xl font-bold text-red-600">{errorCases}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Success Rate</span>
                <p className="text-2xl font-bold text-green-600">{Math.round((completedCases/24)*100)}%</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Detailed Results */}
      {Object.keys(bulkData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collection Results</CardTitle>
            <CardDescription>
              Detailed results for each CHB-MIT patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCases.map(caseId => {
                const data = bulkData[caseId];
                if (!data) return null;

                return (
                  <div key={caseId} className={`p-4 border rounded-md ${
                    data.status === 'success' ? 'bg-green-50 border-green-200' :
                    data.status === 'error' ? 'bg-red-50 border-red-200' :
                    data.status === 'loading' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{caseId.toUpperCase()}</h3>
                      <Badge variant={
                        data.status === 'success' ? 'default' :
                        data.status === 'error' ? 'destructive' :
                        data.status === 'loading' ? 'secondary' : 'outline'
                      }>
                        {data.status}
                      </Badge>
                    </div>
                    
                    {data.status === 'success' && (
                      <div className="space-y-1 text-sm">
                        <p><strong>Seizures:</strong> {data.totalSeizures}</p>
                        <p><strong>Files:</strong> {data.files.length}</p>
                      </div>
                    )}
                    
                    {data.status === 'error' && (
                      <p className="text-sm text-red-600">{data.error}</p>
                    )}
                    
                    {data.status === 'loading' && (
                      <p className="text-sm text-yellow-600">Fetching...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkSeizureCollector;
