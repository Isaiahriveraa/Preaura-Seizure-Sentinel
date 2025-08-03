import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  AlertTriangle,
  Calendar,
  Clock,
  Download,
  Filter
} from "lucide-react";
import { getPatientById, getRiskLevelColor, getSeverityColor, formatSeizureDate, type Patient } from "@/data/mockPatients";
import EEGViewer from "@/components/EEGViewer";

const PatientDetails = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedSeizureId, setSelectedSeizureId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7days' | '30days'>('all');

  useEffect(() => {
    if (!patientId) {
      navigate('/doctor-dashboard');
      return;
    }

    const patientData = getPatientById(patientId);
    if (!patientData) {
      navigate('/doctor-dashboard');
      return;
    }

    setPatient(patientData);
    // Auto-select the most recent seizure
    if (patientData.seizureEvents.length > 0) {
      setSelectedSeizureId(patientData.seizureEvents[0].id);
    }
  }, [patientId, navigate]);

  const getFilteredSeizures = () => {
    if (!patient) return [];

    const now = new Date();
    const cutoffDate = new Date();
    
    switch (filterPeriod) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      default:
        return patient.seizureEvents;
    }

    return patient.seizureEvents.filter(seizure => {
      const seizureDate = new Date(seizure.date);
      return seizureDate >= cutoffDate;
    });
  };

  const exportPatientData = () => {
    if (!patient) return;

    const data = {
      patient: {
        name: patient.name,
        age: patient.age,
        epilepyType: patient.epilepyType,
        riskLevel: patient.riskLevel,
        contactInfo: patient.contactInfo
      },
      seizureEvents: patient.seizureEvents,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patient.name.replace(/\s+/g, '_')}_seizure_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading patient data...</p>
        </div>
      </div>
    );
  }

  const selectedSeizure = patient.seizureEvents.find(s => s.id === selectedSeizureId);
  const filteredSeizures = getFilteredSeizures();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/doctor-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Patient Details: {patient.name}
              </h1>
            </div>
            
            <Button onClick={exportPatientData} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Patient Overview</TabsTrigger>
            <TabsTrigger value="seizures">Seizure History</TabsTrigger>
            <TabsTrigger value="eeg">EEG Analysis</TabsTrigger>
          </TabsList>

          {/* Patient Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p className="text-lg font-semibold">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Age</p>
                      <p className="text-lg font-semibold">{patient.age} years</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Epilepsy Type</p>
                    <p className="text-lg font-semibold">{patient.epilepyType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Level</p>
                    <Badge className={getRiskLevelColor(patient.riskLevel)}>
                      {patient.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Seizure</p>
                    <p className="text-lg font-semibold">
                      {new Date(patient.lastSeizure).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{patient.contactInfo.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{patient.contactInfo.email}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Emergency Contact</p>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>{patient.contactInfo.emergencyContact}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Seizures Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Seizure Activity</CardTitle>
                <CardDescription>Last 30 days summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {patient.seizureEvents.filter(s => {
                        const date = new Date(s.date);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return date >= thirtyDaysAgo;
                      }).length}
                    </div>
                    <div className="text-sm text-red-600">Total Seizures</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(patient.seizureEvents.reduce((sum, s) => sum + s.duration, 0) / patient.seizureEvents.length)}s
                    </div>
                    <div className="text-sm text-orange-600">Avg Duration</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {patient.seizureEvents.filter(s => s.severity === 'severe').length}
                    </div>
                    <div className="text-sm text-yellow-600">Severe Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seizure History Tab */}
          <TabsContent value="seizures" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Seizure Event History</CardTitle>
                    <CardDescription>
                      {filteredSeizures.length} events {filterPeriod !== 'all' ? `in the last ${filterPeriod === '7days' ? '7 days' : '30 days'}` : 'total'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value as 'all' | '7days' | '30days')}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="all">All time</option>
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                    </select>
                  </div>
                </div>
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
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{seizure.time}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{seizure.duration}s duration</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(seizure.severity)}>
                                {seizure.severity}
                              </Badge>
                              <Badge variant="outline">
                                {seizure.type}
                              </Badge>
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
          <TabsContent value="eeg" className="space-y-6">
            {selectedSeizure ? (
              <EEGViewer seizureEvent={selectedSeizure} patientName={patient.name} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No seizure selected</h3>
                  <p className="text-gray-500">Select a seizure event from the history tab to view EEG data</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDetails;
