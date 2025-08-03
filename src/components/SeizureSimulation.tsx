import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Play, 
  Square, 
  Activity,
  AlertTriangle,
  Clock,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EEGViewer from "@/components/EEGViewer";
import { type SeizureEvent } from "@/data/mockPatients";

interface SeizureSimulationProps {
  onSeizureRecorded?: (seizure: SeizureEvent) => void;
}

const SeizureSimulation: React.FC<SeizureSimulationProps> = ({ onSeizureRecorded }) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [simulatedSeizure, setSimulatedSeizure] = useState<SeizureEvent | null>(null);
  const [seizurePhase, setSeizurePhase] = useState<'none' | 'aura' | 'ictal' | 'postictal'>('none');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Simulate seizure phases
          if (newTime === 5) {
            setSeizurePhase('aura');
          } else if (newTime === 15) {
            setSeizurePhase('ictal');
          } else if (newTime === 45) {
            setSeizurePhase('postictal');
          } else if (newTime >= 60) {
            // Auto-stop after 60 seconds
            handleStopRecording();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const generateSeizureId = () => {
    return `seizure-${Date.now()}`;
  };

  const determineSeizureSeverity = (duration: number): 'mild' | 'moderate' | 'severe' => {
    if (duration < 60) return 'mild';
    if (duration < 120) return 'moderate';
    return 'severe';
  };

  const determineSeizureType = (): 'focal' | 'generalized' | 'unknown' => {
    const types: ('focal' | 'generalized')[] = ['focal', 'generalized'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setSeizurePhase('none');
    setSimulatedSeizure(null);
  };

  const handleStopRecording = () => {
    if (recordingTime > 10) { // Only create seizure if recording was longer than 10 seconds
      const now = new Date();
      const seizureId = generateSeizureId();
      
      const newSeizure: SeizureEvent = {
        id: seizureId,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].slice(0, 5),
        duration: recordingTime,
        severity: determineSeizureSeverity(recordingTime),
        type: determineSeizureType(),
        eegImageUrl: `/eeg/simulated_${seizureId}.png`,
        notes: generateSeizureNotes(seizurePhase, recordingTime)
      };

      setSimulatedSeizure(newSeizure);
      
      if (onSeizureRecorded) {
        onSeizureRecorded(newSeizure);
      }
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    setSeizurePhase('none');
  };

  const generateSeizureNotes = (phase: string, duration: number): string => {
    const notes = [];
    
    if (phase === 'aura' || duration >= 5) {
      notes.push('Aura phase detected at onset.');
    }
    
    if (duration >= 15) {
      notes.push('Ictal phase with characteristic EEG changes.');
    }
    
    if (duration >= 45) {
      notes.push('Postictal confusion period observed.');
    }
    
    if (duration > 60) {
      notes.push('Extended seizure duration - medical attention recommended.');
    }
    
    notes.push('EEG data automatically recorded and analyzed.');
    
    return notes.join(' ');
  };

  const getPhaseDescription = (phase: string): { label: string; color: string; description: string } => {
    switch (phase) {
      case 'aura':
        return {
          label: 'Aura Phase',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Pre-seizure warning signs detected'
        };
      case 'ictal':
        return {
          label: 'Ictal Phase',
          color: 'bg-red-100 text-red-800',
          description: 'Active seizure activity in progress'
        };
      case 'postictal':
        return {
          label: 'Postictal Phase',
          color: 'bg-blue-100 text-blue-800',
          description: 'Recovery period after seizure'
        };
      default:
        return {
          label: 'Monitoring',
          color: 'bg-green-100 text-green-800',
          description: 'Normal brain activity being recorded'
        };
    }
  };

  const phaseInfo = getPhaseDescription(seizurePhase);

  return (
    <div className="space-y-6">
      {/* Seizure Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>Seizure Event Recorder</span>
          </CardTitle>
          <CardDescription>
            Record and analyze seizure events with real-time EEG monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <div>
                <p className="font-medium">
                  {isRecording ? 'Recording in Progress' : 'Ready to Record'}
                </p>
                <p className="text-sm text-gray-600">
                  {isRecording ? `Duration: ${recordingTime}s` : 'Press start to begin seizure recording'}
                </p>
              </div>
            </div>
            
            {isRecording && (
              <Badge className={phaseInfo.color}>
                {phaseInfo.label}
              </Badge>
            )}
          </div>

          {/* Phase Information */}
          {isRecording && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <strong>{phaseInfo.label}:</strong> {phaseInfo.description}
              </AlertDescription>
            </Alert>
          )}

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <Button 
                onClick={handleStartRecording}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Play className="h-5 w-5" />
                <span>Start Recording Seizure</span>
              </Button>
            ) : (
              <Button 
                onClick={handleStopRecording}
                variant="outline"
                className="flex items-center space-x-2 border-red-600 text-red-600 hover:bg-red-50"
                size="lg"
              >
                <Square className="h-5 w-5" />
                <span>Stop Recording</span>
              </Button>
            )}
          </div>

          {/* Recording Timer and Warnings */}
          {isRecording && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-2xl font-mono">
                <Clock className="h-6 w-6 text-red-600" />
                <span className="text-red-600">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              {recordingTime > 120 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Extended seizure detected. Consider seeking immediate medical attention.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Information Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Real-time Analysis</h4>
              <p className="text-sm text-gray-600">
                EEG patterns analyzed in real-time during recording
              </p>
            </div>
            
            <div className="text-center">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Automatic Detection</h4>
              <p className="text-sm text-gray-600">
                Seizure phases detected and annotated automatically
              </p>
            </div>
            
            <div className="text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">EEG Visualization</h4>
              <p className="text-sm text-gray-600">
                Full EEG waveforms available after recording
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show EEG Viewer for Recorded Seizure */}
      {simulatedSeizure && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">✅ Seizure Event Recorded</CardTitle>
              <CardDescription>
                Your seizure has been successfully recorded and analyzed. 
                EEG data is now available for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Duration</p>
                  <p className="text-xl font-bold text-blue-800">{simulatedSeizure.duration}s</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-600">Severity</p>
                  <p className="text-xl font-bold text-orange-800 capitalize">{simulatedSeizure.severity}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Type</p>
                  <p className="text-xl font-bold text-purple-800 capitalize">{simulatedSeizure.type}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Status</p>
                  <p className="text-xl font-bold text-green-800">Recorded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <EEGViewer 
            seizureEvent={simulatedSeizure} 
            patientName={user?.email?.split('@')[0] || 'Patient'} 
          />
        </div>
      )}
    </div>
  );
};

export default SeizureSimulation;
