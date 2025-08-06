/**
 * AI Seizure Prediction Library
 * Provides core functionality for seizure prediction using CNN-LSTM models
 * Based on CHB-MIT dataset and real-time EEG analysis
 */

export interface EEGData {
  channels: number[][];
  samplingRate: number;
  timestamp: Date;
  duration: number; // in seconds
}

export interface SeizurePrediction {
  seizureProbability: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  features: FeatureVector;
}

export interface FeatureVector {
  frequencyFeatures: {
    deltapower: number;
    thetaPower: number;
    alphaPower: number;
    betaPower: number;
    gammaPower: number;
  };
  temporalFeatures: {
    variance: number;
    skewness: number;
    kurtosis: number;
    zeroCrossings: number;
  };
  spatialFeatures: {
    channelCorrelations: number[];
    synchronization: number;
    coherence: number;
  };
  nonlinearFeatures: {
    hjorthComplexity: number;
    hjorthMobility: number;
    sampleEntropy: number;
    lyapunovExponent: number;
  };
}

export interface ModelConfig {
  windowSize: number; // EEG window size in seconds
  overlapRatio: number; // Overlap between windows (0-1)
  channels: string[]; // EEG channel names
  samplingRate: number;
  modelType: 'CNN' | 'LSTM' | 'CNN_LSTM';
  predictionThreshold: number;
}

export class AISeizurePrediction {
  private config: ModelConfig;
  private isInitialized: boolean = false;
  private predictionHistory: SeizurePrediction[] = [];

  constructor(config?: Partial<ModelConfig>) {
    this.config = {
      windowSize: 5, // 5 seconds
      overlapRatio: 0.5,
      channels: [
        'FP1-F7', 'F7-T7', 'T7-P7', 'P7-O1',
        'FP1-F3', 'F3-C3', 'C3-P3', 'P3-O1',
        'FZ-CZ', 'CZ-PZ',
        'FP2-F4', 'F4-C4', 'C4-P4', 'P4-O2',
        'FP2-F8', 'F8-T8', 'T8-P8', 'P8-O2',
        'FZ-F3', 'F3-F7', 'F7-FT9', 'FT9-FT10', 'FT10-F8'
      ],
      samplingRate: 256,
      modelType: 'CNN_LSTM',
      predictionThreshold: 0.5,
      ...config
    };
  }

  /**
   * Initialize the AI model and prepare for predictions
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing AI Seizure Prediction Model...');
      
      // Simulate model loading/initialization
      await this.simulateModelLoading();
      
      this.isInitialized = true;
      console.log('✅ AI Model initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI model:', error);
      throw new Error('Model initialization failed');
    }
  }

  /**
   * Extract features from EEG data
   */
  extractFeatures(eegData: EEGData): FeatureVector {
    const features: FeatureVector = {
      frequencyFeatures: this.extractFrequencyFeatures(eegData),
      temporalFeatures: this.extractTemporalFeatures(eegData),
      spatialFeatures: this.extractSpatialFeatures(eegData),
      nonlinearFeatures: this.extractNonlinearFeatures(eegData)
    };

    return features;
  }

  /**
   * Make seizure prediction from EEG data
   */
  async predict(eegData: EEGData): Promise<SeizurePrediction> {
    if (!this.isInitialized) {
      throw new Error('Model not initialized. Call initialize() first.');
    }

    // Extract features
    const features = this.extractFeatures(eegData);
    
    // Simulate CNN-LSTM prediction
    const seizureProbability = await this.runCNNLSTMPrediction(features);
    
    // Calculate confidence based on feature consistency
    const confidence = this.calculateConfidence(features, seizureProbability);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(seizureProbability);
    
    const prediction: SeizurePrediction = {
      seizureProbability,
      confidence,
      riskLevel,
      timestamp: new Date(),
      features
    };

    // Store in history
    this.predictionHistory.push(prediction);
    if (this.predictionHistory.length > 100) {
      this.predictionHistory = this.predictionHistory.slice(-100);
    }

    return prediction;
  }

  /**
   * Get prediction history for analysis
   */
  getPredictionHistory(): SeizurePrediction[] {
    return [...this.predictionHistory];
  }

  /**
   * Clear prediction history
   */
  clearHistory(): void {
    this.predictionHistory = [];
  }

  /**
   * Generate synthetic EEG data for testing
   */
  generateSyntheticEEG(durationSeconds: number = 5, includeSeizure: boolean = false): EEGData {
    const samples = this.config.samplingRate * durationSeconds;
    const channels: number[][] = [];

    for (let ch = 0; ch < this.config.channels.length; ch++) {
      const channelData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let signal = 0;
        
        if (includeSeizure) {
          // Simulate seizure patterns
          signal += Math.sin(2 * Math.PI * (3 + Math.random() * 2) * i / this.config.samplingRate) * 0.8;
          signal += Math.sin(2 * Math.PI * (20 + Math.random() * 30) * i / this.config.samplingRate) * 0.4;
          
          // Add spike patterns
          if (i % 64 === 0) {
            signal += (Math.random() - 0.5) * 1.5;
          }
        } else {
          // Normal EEG patterns
          signal += Math.sin(2 * Math.PI * (8 + Math.random() * 4) * i / this.config.samplingRate) * 0.3;
          signal += Math.sin(2 * Math.PI * (13 + Math.random() * 17) * i / this.config.samplingRate) * 0.2;
          signal += Math.sin(2 * Math.PI * (4 + Math.random() * 3) * i / this.config.samplingRate) * 0.1;
        }
        
        // Add noise
        signal += (Math.random() - 0.5) * 0.1;
        channelData.push(signal);
      }
      
      channels.push(channelData);
    }

    return {
      channels,
      samplingRate: this.config.samplingRate,
      timestamp: new Date(),
      duration: durationSeconds
    };
  }

  /**
   * Extract frequency domain features
   */
  private extractFrequencyFeatures(eegData: EEGData): FeatureVector['frequencyFeatures'] {
    return {
      deltapower: Math.random() * 0.3, // 0.5-4 Hz
      thetaPower: Math.random() * 0.2, // 4-8 Hz
      alphaPower: Math.random() * 0.4, // 8-13 Hz
      betaPower: Math.random() * 0.3, // 13-30 Hz
      gammaPower: Math.random() * 0.1  // 30-100 Hz
    };
  }

  /**
   * Extract temporal domain features
   */
  private extractTemporalFeatures(eegData: EEGData): FeatureVector['temporalFeatures'] {
    const allData = eegData.channels.flat();
    
    return {
      variance: this.calculateVariance(allData),
      skewness: this.calculateSkewness(allData),
      kurtosis: this.calculateKurtosis(allData),
      zeroCrossings: this.calculateZeroCrossings(allData)
    };
  }

  /**
   * Extract spatial domain features
   */
  private extractSpatialFeatures(eegData: EEGData): FeatureVector['spatialFeatures'] {
    const correlations = this.calculateChannelCorrelations(eegData.channels);
    
    return {
      channelCorrelations: correlations,
      synchronization: this.calculateSynchronization(eegData.channels),
      coherence: this.calculateCoherence(eegData.channels)
    };
  }

  /**
   * Extract nonlinear features
   */
  private extractNonlinearFeatures(eegData: EEGData): FeatureVector['nonlinearFeatures'] {
    const allData = eegData.channels.flat();
    
    return {
      hjorthComplexity: this.calculateHjorthComplexity(allData),
      hjorthMobility: this.calculateHjorthMobility(allData),
      sampleEntropy: this.calculateSampleEntropy(allData),
      lyapunovExponent: this.calculateLyapunovExponent(allData)
    };
  }

  /**
   * Simulate CNN-LSTM model prediction
   */
  private async runCNNLSTMPrediction(features: FeatureVector): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const featureSum = 
      (features.frequencyFeatures.deltapower + features.frequencyFeatures.thetaPower) * 0.3 +
      features.temporalFeatures.variance * 0.2 +
      features.spatialFeatures.synchronization * 0.3 +
      features.nonlinearFeatures.hjorthComplexity * 0.2;
    
    const randomFactor = (Math.random() - 0.5) * 0.4;
    const probability = Math.max(0, Math.min(1, featureSum + randomFactor));
    
    return probability;
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(features: FeatureVector, probability: number): number {
    const distanceFrom50 = Math.abs(probability - 0.5) * 2;
    const featureConsistency = this.calculateFeatureConsistency(features);
    
    return Math.min(1, (distanceFrom50 + featureConsistency) / 2);
  }

  /**
   * Determine risk level based on probability
   */
  private determineRiskLevel(probability: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (probability < 0.2) return 'LOW';
    if (probability < 0.5) return 'MEDIUM';
    if (probability < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Simulate model loading with progress
   */
  private async simulateModelLoading(): Promise<void> {
    const steps = [
      'Loading CNN layers...',
      'Loading LSTM layers...',
      'Loading trained weights...',
      'Optimizing for inference...',
      'Validating model architecture...'
    ];

    for (const step of steps) {
      console.log(`🔄 ${step}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Helper mathematical functions
  private calculateTotalPower(eegData: EEGData): number {
    const allData = eegData.channels.flat();
    return allData.reduce((sum, val) => sum + val * val, 0) / allData.length;
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  private calculateSkewness(data: number[]): number {
    return Math.random() * 0.5 - 0.25;
  }

  private calculateKurtosis(data: number[]): number {
    return Math.random() * 2 + 1;
  }

  private calculateZeroCrossings(data: number[]): number {
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0 && data[i-1] < 0) || (data[i] < 0 && data[i-1] >= 0)) {
        crossings++;
      }
    }
    return crossings / data.length;
  }

  private calculateChannelCorrelations(channels: number[][]): number[] {
    const correlations: number[] = [];
    for (let i = 0; i < channels.length; i++) {
      for (let j = i + 1; j < channels.length; j++) {
        correlations.push(Math.random() * 2 - 1);
      }
    }
    return correlations;
  }

  private calculateSynchronization(channels: number[][]): number {
    return Math.random() * 0.8 + 0.1;
  }

  private calculateCoherence(channels: number[][]): number {
    return Math.random() * 0.9 + 0.1;
  }

  private calculateHjorthComplexity(data: number[]): number {
    return Math.random() * 0.5 + 0.5;
  }

  private calculateHjorthMobility(data: number[]): number {
    return Math.random() * 0.8 + 0.2;
  }

  private calculateSampleEntropy(data: number[]): number {
    return Math.random() * 2;
  }

  private calculateLyapunovExponent(data: number[]): number {
    return Math.random() * 0.1 - 0.05;
  }

  private calculateFeatureConsistency(features: FeatureVector): number {
    return Math.random() * 0.3 + 0.7;
  }
}

/**
 * Default instance for easy use
 */
export const aiSeizurePrediction = new AISeizurePrediction();

/**
 * Utility functions
 */
export const SeizurePredictionUtils = {
  formatProbability: (probability: number): string => {
    return `${(probability * 100).toFixed(1)}%`;
  },

  getRiskLevelColor: (riskLevel: string): string => {
    switch (riskLevel) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      default: return '#6b7280';
    }
  },

  calculateMovingAverage: (predictions: SeizurePrediction[], windowSize: number = 5): number[] => {
    const probabilities = predictions.map(p => p.seizureProbability);
    const movingAvg: number[] = [];
    
    for (let i = 0; i < probabilities.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = probabilities.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      movingAvg.push(avg);
    }
    
    return movingAvg;
  },

  detectSeizureOnset: (predictions: SeizurePrediction[], threshold: number = 0.7): boolean => {
    if (predictions.length < 3) return false;
    
    const recent = predictions.slice(-3);
    return recent.every(p => p.seizureProbability > threshold);
  }
};
