/**
 * EEG Data Generator for Seizure Events
 * Generates unique synthetic EEG waveforms based on seizure characteristics
 */

export interface EEGDataPoint {
  timestamp: number;
  channels: {
    [channel: string]: number; // µV (microvolts)
  };
}

export interface EEGData {
  id: string;
  seizureId: string;
  samplingRate: number; // Hz
  duration: number; // seconds
  channels: string[];
  data: EEGDataPoint[];
  metadata: {
    seizureType: string;
    severity: number;
    phase: 'aura' | 'ictal' | 'postictal';
    generatedAt: Date;
  };
}

/**
 * Standard EEG electrode positions (10-20 system)
 */
const EEG_CHANNELS = [
  'Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 
  'O1', 'O2', 'F7', 'F8', 'T3', 'T4', 'T5', 'T6'
];

/**
 * Generates unique EEG patterns based on seizure characteristics
 */
export class EEGGenerator {
  private static getSeizurePattern(seizureId: string, phase: string, time: number): number {
    // Create unique patterns based on seizure ID and characteristics
    const seed = this.hashCode(seizureId + phase) / 1000000;
    
    switch (phase) {
      case 'aura':
        // Pre-ictal: Subtle frequency changes, mild amplitude variations
        return Math.sin(time * 8 + seed) * 20 + 
               Math.sin(time * 13 + seed * 2) * 10 +
               (Math.random() - 0.5) * 5;
               
      case 'ictal':
        // Ictal: High amplitude spikes, synchronized activity
        const spikeFreq = 3 + (seed % 2); // 3-5 Hz spikes
        const amplitude = 80 + (seed % 40); // 80-120 µV
        return Math.sin(time * spikeFreq * 2 * Math.PI + seed) * amplitude +
               Math.sin(time * 15 + seed) * 30 +
               (Math.random() - 0.5) * 20;
               
      case 'postictal':
        // Post-ictal: Suppressed activity, slow recovery
        return Math.sin(time * 2 + seed) * 10 +
               Math.sin(time * 5 + seed * 1.5) * 15 +
               (Math.random() - 0.5) * 8;
               
      default:
        // Normal activity: 8-12 Hz alpha waves
        return Math.sin(time * 10 + seed) * 25 +
               Math.sin(time * 8.5 + seed * 0.7) * 15 +
               (Math.random() - 0.5) * 10;
    }
  }

  /**
   * Generate unique hash from string for consistent randomization
   */
  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate realistic EEG data for a seizure event
   */
  static generateSeizureEEG(
    seizureId: string,
    duration: number = 60,
    seizureType: string = 'tonic-clonic',
    severity: number = 5
  ): EEGData {
    console.log('🧬 EEG Generator - Starting generation');
    console.log('📊 Parameters:', { seizureId, duration, seizureType, severity });
    
    const samplingRate = 250; // 250 Hz standard for clinical EEG
    const totalSamples = duration * samplingRate;
    const data: EEGDataPoint[] = [];

    console.log('📏 EEG specs:', { samplingRate, totalSamples, expectedChannels: EEG_CHANNELS.length });

    // Generate unique seed for this specific seizure
    const seizureSeed = this.hashCode(seizureId);
    console.log('🎲 Seizure seed:', seizureSeed);
    
    for (let i = 0; i < totalSamples; i++) {
      const time = i / samplingRate;
      const timestamp = Date.now() + (i * 4); // 4ms intervals
      
      // Determine seizure phase based on time
      let phase: 'aura' | 'ictal' | 'postictal';
      if (time < 10) phase = 'aura';
      else if (time < 40) phase = 'ictal';
      else phase = 'postictal';

      const channels: { [channel: string]: number } = {};
      
      EEG_CHANNELS.forEach((channel, channelIndex) => {
        // Each channel has unique characteristics based on brain region
        const channelSeed = seizureSeed + channelIndex * 1000;
        const basePattern = this.getSeizurePattern(seizureId, phase, time);
        
        // Add channel-specific variations
        const channelVariation = Math.sin(time * 12 + channelSeed / 10000) * 5;
        const spatialModifier = this.getChannelModifier(channel, seizureType, severity);
        
        channels[channel] = (basePattern + channelVariation) * spatialModifier;
      });

      data.push({
        timestamp,
        channels
      });
    }

    const eegResult = {
      id: `eeg_${seizureId}_${Date.now()}`,
      seizureId,
      samplingRate,
      duration,
      channels: EEG_CHANNELS,
      data,
      metadata: {
        seizureType,
        severity,
        phase: 'ictal' as const, // Primary phase
        generatedAt: new Date()
      }
    };

    console.log('✅ EEG Generation Complete');
    console.log('📈 Generated data summary:', {
      id: eegResult.id,
      totalDataPoints: eegResult.data.length,
      channelsCount: eegResult.channels.length,
      firstDataPoint: eegResult.data[0],
      lastDataPoint: eegResult.data[eegResult.data.length - 1],
      sampleChannelValues: eegResult.data[0]?.channels
    });

    return eegResult;
  }

  /**
   * Apply spatial modifiers based on electrode location and seizure type
   */
  private static getChannelModifier(
    channel: string, 
    seizureType: string, 
    severity: number
  ): number {
    const baseModifier = 0.8 + (severity / 10) * 0.4; // 0.8 to 1.2 based on severity
    
    // Different seizure types affect different brain regions
    switch (seizureType) {
      case 'focal':
        // Focal seizures - more localized activity
        if (['F3', 'F4', 'Fp1', 'Fp2'].includes(channel)) {
          return baseModifier * 1.5; // Frontal emphasis
        }
        return baseModifier * 0.7;
        
      case 'temporal':
        // Temporal lobe seizures
        if (['T3', 'T4', 'T5', 'T6'].includes(channel)) {
          return baseModifier * 1.8; // Temporal emphasis
        }
        return baseModifier * 0.6;
        
      case 'generalized':
      case 'tonic-clonic':
      default:
        // Generalized seizures - widespread activity
        return baseModifier;
    }
  }

  /**
   * Generate cleaned/processed EEG data (what doctors typically analyze)
   */
  static generateCleanedEEG(rawEEG: EEGData): EEGData {
    const cleanedData = rawEEG.data.map(point => ({
      timestamp: point.timestamp,
      channels: Object.fromEntries(
        Object.entries(point.channels).map(([channel, value]) => [
          channel,
          this.applyFiltering(value, point.timestamp / 1000)
        ])
      )
    }));

    return {
      ...rawEEG,
      id: rawEEG.id + '_cleaned',
      data: cleanedData
    };
  }

  /**
   * Apply digital filtering to simulate cleaned EEG
   */
  private static applyFiltering(value: number, time: number): number {
    // Simulate bandpass filtering (1-70 Hz) and noise reduction
    const filtered = value * 0.9; // Slight amplitude reduction
    const noiseReduction = (Math.random() - 0.5) * 3; // Reduced noise
    return filtered + noiseReduction;
  }
}
