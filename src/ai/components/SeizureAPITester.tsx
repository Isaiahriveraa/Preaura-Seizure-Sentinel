import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Brain, Zap, Clock, FileText } from 'lucide-react';
import { CHBSeizureAPI } from '../data/chbSeizureAPI';

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

export const SeizureAPITester: React.FC = () => {
  const [seizureData, setSeizureData] = useState<CHBCaseSeizures | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState('chb01');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const fetchSeizureData = async () => {
    setLoading(true);
    setError(null);
    setSeizureData(null);

    try {
      console.log(`🔍 Testing CHB Seizure API for ${selectedCase}...`);
      const data = await CHBSeizureAPI.fetchSeizureData(selectedCase);
      setSeizureData(data);
      setExpandedSections(new Set(['overview', 'seizures'])); // Auto-expand main sections
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ API test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            CHB-MIT Seizure API Tester
          </CardTitle>
          <CardDescription>
            Test fetching seizure timing data from PhysioNet's official CHB-MIT database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <select 
              value={selectedCase} 
              onChange={(e) => setSelectedCase(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {Array.from({length: 24}, (_, i) => `chb${String(i + 1).padStart(2, '0')}`).map(caseId => (
                <option key={caseId} value={caseId}>{caseId.toUpperCase()}</option>
              ))}
            </select>
            <Button 
              onClick={fetchSeizureData} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>⏳ Fetching...</>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Fetch Seizure Data
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">❌ Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {seizureData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              Seizure Data for {seizureData.caseId.toUpperCase()}
            </CardTitle>
            <CardDescription>
              Official seizure timing from PhysioNet CHB-MIT database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Overview Section */}
            <Collapsible open={expandedSections.has('overview')}>
              <CollapsibleTrigger 
                onClick={() => toggleSection('overview')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                <h3 className="font-semibold flex items-center gap-2">
                  📊 Patient Overview
                </h3>
                {expandedSections.has('overview') ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Patient ID:</span>
                    <p className="text-lg">{seizureData.caseId.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Seizures:</span>
                    <p className="text-lg font-bold text-red-600">{seizureData.totalSeizures}</p>
                  </div>
                  <div>
                    <span className="font-medium">Recording Files:</span>
                    <p className="text-lg">{seizureData.files.length}</p>
                  </div>
                  <div>
                    <span className="font-medium">Data Source:</span>
                    <p className="text-lg">PhysioNet CHB-MIT</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Files Section */}
            <Collapsible open={expandedSections.has('files')}>
              <CollapsibleTrigger 
                onClick={() => toggleSection('files')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                <h3 className="font-semibold flex items-center gap-2">
                  📁 Recording Files ({seizureData.files.length})
                </h3>
                {expandedSections.has('files') ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-2 gap-2">
                  {seizureData.files.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-sm">{fileName}</span>
                      <Badge variant="outline">
                        {seizureData.seizureEvents.filter(s => s.fileName === fileName).length} seizures
                      </Badge>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Seizures Section */}
            <Collapsible open={expandedSections.has('seizures')}>
              <CollapsibleTrigger 
                onClick={() => toggleSection('seizures')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                <h3 className="font-semibold flex items-center gap-2">
                  🚨 Seizure Events ({seizureData.totalSeizures})
                </h3>
                {expandedSections.has('seizures') ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-4 border rounded-md bg-white">
                <div className="space-y-3">
                  {seizureData.seizureEvents.map((seizure, index) => (
                    <div key={index} className="p-4 border border-red-200 rounded-md bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-red-800">
                          Seizure #{seizure.seizureNumber}
                        </h4>
                        <Badge variant="destructive">
                          {formatTime(seizure.duration)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">File:</span>
                          <p className="font-mono">{seizure.fileName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Start Time:</span>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(seizure.startTime)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">End Time:</span>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(seizure.endTime)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">AI Training Label:</span>
                          <p className="text-red-600 font-bold">SEIZURE (1)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* AI Format Section */}
            <Collapsible open={expandedSections.has('ai-format')}>
              <CollapsibleTrigger 
                onClick={() => toggleSection('ai-format')}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-md hover:bg-gray-100"
              >
                <h3 className="font-semibold flex items-center gap-2">
                  🤖 AI Training Format
                </h3>
                {expandedSections.has('ai-format') ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-4 border rounded-md bg-white">
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(CHBSeizureAPI.convertToAIFormat(seizureData), null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>

          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeizureAPITester;
