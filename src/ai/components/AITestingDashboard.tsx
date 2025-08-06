import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Activity, TestTube, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { 
  AISeizurePrediction, 
  aiSeizurePrediction, 
  SeizurePrediction, 
  EEGData,
  SeizurePredictionUtils 
} from '@/lib/aiSeizurePrediction';

export const AITestingDashboard: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<SeizurePrediction[]>([]);
  const [currentEEG, setCurrentEEG] = useState<EEGData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState(0);

  const initializeAI = async () => {
    setIsLoading(true);
    setError(null);
    setInitProgress(0);
    
    try {
      console.log('🧠 Initializing AI Seizure Prediction System...');
      
      // Simulate progressive loading
      const steps = [
        'Initializing CNN layers...',
        'Loading LSTM components...',
        'Loading trained weights...',
        'Optimizing for inference...',
        'Validating model architecture...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        console.log(`🔄 ${steps[i]}`);
        setInitProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      await aiSeizurePrediction.initialize();
      setIsInitialized(true);
      setInitProgress(100);
      console.log('✅ AI System fully initialized');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI initialization failed');
      console.error('❌ AI initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestEEG = (seizureType: boolean) => {
    if (!isInitialized) return;
    
    console.log(`📊 Generating ${seizureType ? 'seizure' : 'normal'} EEG data...`);
    const eeg = aiSeizurePrediction.generateSyntheticEEG(5, seizureType);
    setCurrentEEG(eeg);
    
    console.log(`✅ Generated EEG with ${eeg.channels.length} channels, ${eeg.channels[0].length} samples each`);
  };

  const runPrediction = async () => {
    if (!currentEEG || !isInitialized) return;
    
    setIsLoading(true);
    try {
      console.log('🤖 Running AI prediction...');
      const prediction = await aiSeizurePrediction.predict(currentEEG);
      setPredictions(prev => [prediction, ...prev].slice(0, 10));
      
      console.log(`🎯 Prediction: ${SeizurePredictionUtils.formatProbability(prediction.seizureProbability)} (${prediction.riskLevel})`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const runBatchTest = async () => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    setPredictions([]);
    
    try {
      console.log('🔬 Running batch AI test...');
      
      // Test 5 normal and 5 seizure patterns
      for (let i = 0; i < 10; i++) {
        const isSeizure = i >= 5;
        const eeg = aiSeizurePrediction.generateSyntheticEEG(3, isSeizure);
        const prediction = await aiSeizurePrediction.predict(eeg);
        
        setPredictions(prev => [prediction, ...prev]);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('✅ Batch test completed');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const clearTests = () => {
    setPredictions([]);
    setCurrentEEG(null);
    aiSeizurePrediction.clearHistory();
    console.log('🧹 Test results cleared');
  };

  return (
    <div className="p-6 space-y-6">
      {/* AI Initialization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Seizure Prediction System
          </CardTitle>
          <CardDescription>
            Test and validate the CNN-LSTM seizure prediction model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {!isInitialized ? (
            <div className="space-y-4">
              <Button 
                onClick={initializeAI} 
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>🔄 Initializing AI System...</>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Initialize AI Model
                  </>
                )}
              </Button>
              
              {isLoading && (
                <div className="space-y-2">
                  <Progress value={initProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-600">
                    {initProgress}% - Loading AI components...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                AI Model Ready
              </Badge>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">❌ Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Testing Controls */}
      {isInitialized && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-purple-600" />
              AI Testing Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Testing Controls */}
            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={() => generateTestEEG(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Generate Normal EEG
              </Button>
              <Button 
                onClick={() => generateTestEEG(true)}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200"
              >
                <Zap className="h-4 w-4" />
                Generate Seizure EEG
              </Button>
              {currentEEG && (
                <Button 
                  onClick={runPrediction}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "🔄 Analyzing..." : "🤖 Run Prediction"}
                </Button>
              )}
              <Button 
                onClick={runBatchTest}
                disabled={isLoading}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {isLoading ? "🔄 Running Batch..." : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Batch Test (10x)
                  </>
                )}
              </Button>
            </div>

            {/* Current EEG Info */}
            {currentEEG && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Current EEG Data:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Channels:</span> {currentEEG.channels.length}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {currentEEG.duration}s
                  </div>
                  <div>
                    <span className="font-medium">Sampling Rate:</span> {currentEEG.samplingRate} Hz
                  </div>
                  <div>
                    <span className="font-medium">Total Samples:</span> {currentEEG.channels[0]?.length || 0}
                  </div>
                </div>
              </div>
            )}

            {predictions.length > 0 && (
              <div className="flex items-center gap-4 pt-2 border-t">
                <Button onClick={clearTests} variant="outline" size="sm">
                  Clear Results
                </Button>
                <div className="text-sm text-gray-600">
                  Total Predictions: {predictions.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prediction Results */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-green-600" />
              AI Prediction Results ({predictions.length})
            </CardTitle>
            <CardDescription>
              Real-time seizure predictions from CNN-LSTM model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.map((prediction, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 transition-all ${
                    prediction.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-500' :
                    prediction.riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-500' :
                    prediction.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        style={{ 
                          backgroundColor: SeizurePredictionUtils.getRiskLevelColor(prediction.riskLevel),
                          color: 'white'
                        }}
                      >
                        {prediction.riskLevel}
                      </Badge>
                      <span className="text-xl font-bold">
                        {SeizurePredictionUtils.formatProbability(prediction.seizureProbability)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Confidence: {SeizurePredictionUtils.formatProbability(prediction.confidence)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {prediction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="font-medium">Delta Power:</span>
                      <p className="text-blue-600">{prediction.features.frequencyFeatures.deltapower.toFixed(3)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Alpha Power:</span>
                      <p className="text-green-600">{prediction.features.frequencyFeatures.alphaPower.toFixed(3)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Variance:</span>
                      <p className="text-purple-600">{prediction.features.temporalFeatures.variance.toFixed(3)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Synchronization:</span>
                      <p className="text-orange-600">{prediction.features.spatialFeatures.synchronization.toFixed(3)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AITestingDashboard;
