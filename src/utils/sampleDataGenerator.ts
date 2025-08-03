// Sample data generator for development and testing
export const generateSampleEEGData = (
  duration: number, 
  channels: number = 8, 
  isRaw: boolean = false
): number[][] => {
  const sampleRate = 256; // Hz
  const samples = duration * sampleRate;
  const data: number[][] = [];

  for (let channel = 0; channel < channels; channel++) {
    const channelData: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      let value = 0;
      
      // Base EEG rhythms
      value += Math.sin((i / sampleRate) * 2 * Math.PI * 10) * 20; // Alpha (8-12 Hz)
      value += Math.sin((i / sampleRate) * 2 * Math.PI * 6) * 15;  // Theta (4-8 Hz)
      value += Math.sin((i / sampleRate) * 2 * Math.PI * 20) * 10; // Beta (13-30 Hz)
      
      // Add seizure activity during middle portion
      const seizureStart = samples * 0.3;
      const seizureEnd = samples * 0.7;
      
      if (i >= seizureStart && i <= seizureEnd) {
        // High frequency spike activity
        value += Math.sin((i / sampleRate) * 2 * Math.PI * 40) * 50;
        value += Math.random() * 40 - 20; // Chaotic spikes
        
        // Sharp waves
        if (i % 64 < 16) {
          value += 80 * Math.exp(-(((i % 64) - 8) ** 2) / 8);
        }
      }
      
      // Add artifacts and noise for raw data
      if (isRaw) {
        value += (Math.random() - 0.5) * 25; // Random noise
        
        // Occasional muscle artifacts
        if (Math.random() < 0.001) {
          value += (Math.random() - 0.5) * 100;
        }
        
        // Electrode movement artifacts
        if (Math.random() < 0.0005) {
          value += Math.sin(i * 0.1) * 60;
        }
      }
      
      channelData.push(value);
    }
    
    data.push(channelData);
  }
  
  return data;
};

export const EEG_CHANNEL_LABELS = [
  'Fp1-F3', 'F3-C3', 'C3-P3', 'P3-O1',
  'Fp2-F4', 'F4-C4', 'C4-P4', 'P4-O2'
];

export const generateSeizureMarkers = (duration: number) => {
  const markers = [];
  const seizureStart = duration * 0.3;
  const seizureEnd = duration * 0.7;
  
  markers.push({
    time: seizureStart,
    label: 'Seizure Onset',
    type: 'start'
  });
  
  markers.push({
    time: seizureEnd,
    label: 'Seizure End',
    type: 'end'
  });
  
  return markers;
};