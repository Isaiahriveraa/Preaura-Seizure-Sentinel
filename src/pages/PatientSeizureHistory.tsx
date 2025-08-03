import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Calendar, 
  Clock, 
  Brain,
  Download,
  Filter,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EEGViewer from "@/components/EEGViewer";
import { formatSeizureDate, getSeverityColor, type SeizureEvent } from "@/data/mockPatients";

// Patient seizure data - in a real app, this would come from the user's profile
const PATIENT_SEIZURE_DATA: SeizureEvent[] = [
  {
    id: 'seizure-001',
    date: '2025-08-01',
    time: '14:32',
    duration: 120,
    severity: 'moderate',
    type: 'focal',
    eegImageUrl: '/eeg/patient_seizure_001.png',
    notes: 'Felt aura 5 minutes before onset. Quick recovery after episode.'
  },
  {
    id: 'seizure-002',
    date: '2025-07-28',
    time: '09:15',
    duration: 90,
    severity: 'mild',
    type: 'focal',
    eegImageUrl: '/eeg/patient_seizure_002.png',
    notes: 'Sleep-related seizure. Woke up confused but no complications.'
  },
  {
    id: 'seizure-003',
    date: '2025-07-25',
    time: '16:45',
    duration: 180,
    severity: 'severe',
    type: 'generalized',
    eegImageUrl: '/eeg/patient_seizure_003.png',
    notes: 'Tonic-clonic seizure. Emergency contact was notified.'
  },
  {
    id: 'seizure-004',
    date: '2025-07-20',
    time: '11:30',
    duration: 75,
    severity: 'moderate',
    type: 'focal',
    eegImageUrl: '/eeg/patient_seizure_004.png',
    notes: 'Complex partial seizure with brief confusion period.'
  },
  {
    id: 'seizure-005',
    date: '2025-07-15',
    time: '22:18',
    duration: 45,
    severity: 'mild',
    type: 'focal',
    eegImageUrl: '/eeg/patient_seizure_005.png',
    notes: 'Nocturnal seizure. Brief motor symptoms only.'
  }
];

const PatientSeizureHistory = () => {
  const { user } = useAuth();
  const [selectedSeizureId, setSelectedSeizureId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [filteredSeizures, setFilteredSeizures] = useState<SeizureEvent[]>(PATIENT_SEIZURE_DATA);

  useEffect(() => {
    // Auto-select the most recent seizure
    if (PATIENT_SEIZURE_DATA.length > 0) {
      setSelectedSeizureId(PATIENT_SEIZURE_DATA[0].id);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (filterPeriod) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        setFilteredSeizures(PATIENT_SEIZURE_DATA);
        return;
    }

    const filtered = PATIENT_SEIZURE_DATA.filter(seizure => {
      const seizureDate = new Date(seizure.date);
      return seizureDate >= cutoffDate;
    });
    
    setFilteredSeizures(filtered);
  }, [filterPeriod]);

  const selectedSeizure = PATIENT_SEIZURE_DATA.find(s => s.id === selectedSeizureId);

  const getSeizureStats = () => {
    const totalSeizures = filteredSeizures.length;
    const avgDuration = totalSeizures > 0 
      ? Math.round(filteredSeizures.reduce((sum, s) => sum + s.duration, 0) / totalSeizures)
      : 0;
    const severeCount = filteredSeizures.filter(s => s.severity === 'severe').length;
    const recentSeizure = filteredSeizures[0]?.date || 'No recent seizures';

    return { totalSeizures, avgDuration, severeCount, recentSeizure };
  };

  const stats = getSeizureStats();

  const exportSeizureData = () => {
    const data = {
      patientName: user?.email || 'Patient',
      seizureHistory: filteredSeizures,
      exportDate: new Date().toISOString(),
      filterPeriod
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_seizure_history_${filterPeriod}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>My Seizure History & EEG Data</span>
          </CardTitle>
          <CardDescription>
            View your seizure events and associated EEG recordings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSeizures}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {filterPeriod === 'all' ? 'All time' : `Last ${filterPeriod === '7days' ? '7 days' : filterPeriod === '30days' ? '30 days' : '90 days'}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgDuration}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Average episode length</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Severe Events</p>
                <p className="text-2xl font-bold text-red-600">{stats.severeCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Requiring intervention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Event</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.recentSeizure !== 'No recent seizures' 
                    ? new Date(stats.recentSeizure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'None'
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Most recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="history" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="history">Event History</TabsTrigger>
            <TabsTrigger value="eeg">EEG Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as 'all' | '7days' | '30days' | '90days')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All time</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
            <Button onClick={exportSeizureData} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Event History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Seizure Events</CardTitle>
              <CardDescription>
                {filteredSeizures.length} events found. Click on an event to view its EEG data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSeizures.map((seizure) => (
                  <div
                    key={seizure.id}
                    onClick={() => setSelectedSeizureId(seizure.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSeizureId === seizure.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <Calendar className="h-4 w-4 text-gray-400 mx-auto" />
                          <div className="text-sm font-medium">
                            {new Date(seizure.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500">{seizure.time}</div>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-gray-600">{seizure.duration}s duration</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{seizure.type} seizure</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(seizure.severity)}>
                              {seizure.severity}
                            </Badge>
                            <TrendingUp className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">EEG available</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={selectedSeizureId === seizure.id ? "default" : "outline"}
                        size="sm"
                      >
                        View EEG
                      </Button>
                    </div>
                    
                    {seizure.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">{seizure.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredSeizures.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No seizures found</h3>
                    <p className="text-gray-500">No seizure events in the selected time period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EEG Analysis Tab */}
        <TabsContent value="eeg">
          {selectedSeizure ? (
            <EEGViewer 
              seizureEvent={selectedSeizure} 
              patientName={user?.email?.split('@')[0] || 'You'} 
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No seizure selected</h3>
                <p className="text-gray-500">Select a seizure event from the history tab to view EEG data</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Seizure Patterns & Trends</CardTitle>
              <CardDescription>Analysis of your seizure patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Frequency Trend</h4>
                    <p className="text-sm text-blue-800">
                      Your seizure frequency has been relatively stable over the past 3 months. 
                      Most events occur during sleep or early morning hours.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Duration Pattern</h4>
                    <p className="text-sm text-green-800">
                      Average seizure duration has decreased by 15% compared to last quarter. 
                      This suggests improved seizure control.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Severity Analysis</h4>
                    <p className="text-sm text-orange-800">
                      Most recent events have been mild to moderate. Last severe event was 
                      {PATIENT_SEIZURE_DATA.find(s => s.severity === 'severe')?.date || 'several weeks ago'}.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Recommendation</h4>
                    <p className="text-sm text-purple-800">
                      Continue current medication regimen. Consider discussing sleep hygiene 
                      with your doctor as many events occur during sleep transitions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientSeizureHistory;
