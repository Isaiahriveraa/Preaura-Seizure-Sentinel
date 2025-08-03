import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Calendar, 
  AlertTriangle, 
  Activity,
  LogOut,
  Stethoscope,
  Clock
} from "lucide-react";
import { MOCK_PATIENTS, getRiskLevelColor, type Patient } from "@/data/mockPatients";

interface DoctorSession {
  email: string;
  name: string;
  specialty: string;
  loginTime: string;
}

const DoctorDashboard = () => {
  const [doctorSession, setDoctorSession] = useState<DoctorSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if doctor is logged in
    const sessionData = localStorage.getItem('doctorSession');
    if (!sessionData) {
      navigate('/doctor-login');
      return;
    }
    
    const session = JSON.parse(sessionData);
    setDoctorSession(session);
  }, [navigate]);

  useEffect(() => {
    // Filter patients based on search term
    const filtered = MOCK_PATIENTS.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.epilepyType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('doctorSession');
    navigate('/doctor-login');
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/patient-details/${patientId}`);
  };

  const getRecentSeizureCount = (patient: Patient): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return patient.seizureEvents.filter(seizure => {
      const seizureDate = new Date(seizure.date);
      return seizureDate >= oneWeekAgo;
    }).length;
  };

  if (!doctorSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Doctor Portal</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{doctorSession.name}</p>
                <p className="text-xs text-gray-500">{doctorSession.specialty}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{MOCK_PATIENTS.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {MOCK_PATIENTS.filter(p => p.riskLevel === 'high').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Seizures</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {MOCK_PATIENTS.reduce((sum, patient) => sum + getRecentSeizureCount(patient), 0)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>
                  Click on a patient to view their seizure history and EEG data
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handlePatientClick(patient.id)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">Age {patient.age} • {patient.epilepyType}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Last seizure: {new Date(patient.lastSeizure).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getRiskLevelColor(patient.riskLevel)}>
                          {patient.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {patient.seizureEvents.length} total events
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {getRecentSeizureCount(patient)}
                        </div>
                        <div className="text-xs text-gray-500">This week</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorDashboard;
