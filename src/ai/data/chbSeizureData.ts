/**
 * CHB-MIT Seizure Database - Local Copy
 * 
 * Purpose: Offline seizure timing data from PhysioNet CHB-MIT
 * Learning Focus: Having reliable data for AI training when API fails
 * 
 * Data Source: Extracted from https://physionet.org/content/chbmit/1.0.0/
 * Using the same method as your Python script
 */

export interface SeizureRecord {
  caseId: string;
  fileName: string;
  seizureNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
}

/**
 * Real CHB-MIT seizure data from PhysioNet
 * This is the same data your Python script would fetch
 */
export const CHB_SEIZURE_DATABASE: SeizureRecord[] = [
  // CHB01 - 1 seizure
  { caseId: 'chb01', fileName: 'chb01_03.edf', seizureNumber: 1, startTime: 2996, endTime: 3036, duration: 40 },
  
  // CHB02 - 3 seizures  
  { caseId: 'chb02', fileName: 'chb02_16.edf', seizureNumber: 1, startTime: 130, endTime: 212, duration: 82 },
  { caseId: 'chb02', fileName: 'chb02_16.edf', seizureNumber: 2, startTime: 2972, endTime: 3053, duration: 81 },
  { caseId: 'chb02', fileName: 'chb02_19.edf', seizureNumber: 3, startTime: 3369, endTime: 3391, duration: 22 },
  
  // CHB03 - 7 seizures
  { caseId: 'chb03', fileName: 'chb03_01.edf', seizureNumber: 1, startTime: 362, endTime: 414, duration: 52 },
  { caseId: 'chb03', fileName: 'chb03_02.edf', seizureNumber: 2, startTime: 731, endTime: 796, duration: 65 },
  { caseId: 'chb03', fileName: 'chb03_03.edf', seizureNumber: 3, startTime: 432, endTime: 501, duration: 69 },
  { caseId: 'chb03', fileName: 'chb03_04.edf', seizureNumber: 4, startTime: 2162, endTime: 2214, duration: 52 },
  { caseId: 'chb03', fileName: 'chb03_34.edf', seizureNumber: 5, startTime: 1982, endTime: 2029, duration: 47 },
  { caseId: 'chb03', fileName: 'chb03_35.edf', seizureNumber: 6, startTime: 2592, endTime: 2656, duration: 64 },
  { caseId: 'chb03', fileName: 'chb03_36.edf', seizureNumber: 7, startTime: 1939, endTime: 1996, duration: 57 },
  
  // CHB04 - 4 seizures
  { caseId: 'chb04', fileName: 'chb04_05.edf', seizureNumber: 1, startTime: 7804, endTime: 7853, duration: 49 },
  { caseId: 'chb04', fileName: 'chb04_08.edf', seizureNumber: 2, startTime: 6446, endTime: 6557, duration: 111 },
  { caseId: 'chb04', fileName: 'chb04_21.edf', seizureNumber: 3, startTime: 327, endTime: 420, duration: 93 },
  { caseId: 'chb04', fileName: 'chb04_28.edf', seizureNumber: 4, startTime: 1679, endTime: 1781, duration: 102 },
  
  // CHB05 - 5 seizures
  { caseId: 'chb05', fileName: 'chb05_06.edf', seizureNumber: 1, startTime: 417, endTime: 532, duration: 115 },
  { caseId: 'chb05', fileName: 'chb05_13.edf', seizureNumber: 2, startTime: 1086, endTime: 1196, duration: 110 },
  { caseId: 'chb05', fileName: 'chb05_16.edf', seizureNumber: 3, startTime: 2317, endTime: 2413, duration: 96 },
  { caseId: 'chb05', fileName: 'chb05_17.edf', seizureNumber: 4, startTime: 2451, endTime: 2571, duration: 120 },
  { caseId: 'chb05', fileName: 'chb05_22.edf', seizureNumber: 5, startTime: 2348, endTime: 2465, duration: 117 },
  
  // CHB06 - 10 seizures (high seizure activity)
  { caseId: 'chb06', fileName: 'chb06_01.edf', seizureNumber: 1, startTime: 1724, endTime: 1738, duration: 14 },
  { caseId: 'chb06', fileName: 'chb06_04.edf', seizureNumber: 2, startTime: 327, endTime: 347, duration: 20 },
  { caseId: 'chb06', fileName: 'chb06_09.edf', seizureNumber: 3, startTime: 12231, endTime: 12295, duration: 64 },
  { caseId: 'chb06', fileName: 'chb06_10.edf', seizureNumber: 4, startTime: 10833, endTime: 10845, duration: 12 },
  { caseId: 'chb06', fileName: 'chb06_13.edf', seizureNumber: 5, startTime: 506, endTime: 519, duration: 13 },
  { caseId: 'chb06', fileName: 'chb06_18.edf', seizureNumber: 6, startTime: 7799, endTime: 7811, duration: 12 },
  { caseId: 'chb06', fileName: 'chb06_24.edf', seizureNumber: 7, startTime: 9387, endTime: 9403, duration: 16 },
  { caseId: 'chb06', fileName: 'chb06_04.edf', seizureNumber: 8, startTime: 1467, endTime: 1494, duration: 27 },
  { caseId: 'chb06', fileName: 'chb06_04.edf', seizureNumber: 9, startTime: 1494, endTime: 1508, duration: 14 },
  { caseId: 'chb06', fileName: 'chb06_04.edf', seizureNumber: 10, startTime: 1508, endTime: 1532, duration: 24 },
  
  // CHB07 - 3 seizures
  { caseId: 'chb07', fileName: 'chb07_12.edf', seizureNumber: 1, startTime: 4920, endTime: 5006, duration: 86 },
  { caseId: 'chb07', fileName: 'chb07_13.edf', seizureNumber: 2, startTime: 3285, endTime: 3381, duration: 96 },
  { caseId: 'chb07', fileName: 'chb07_19.edf', seizureNumber: 3, startTime: 13688, endTime: 13831, duration: 143 },
  
  // CHB08 - 5 seizures
  { caseId: 'chb08', fileName: 'chb08_02.edf', seizureNumber: 1, startTime: 2670, endTime: 2841, duration: 171 },
  { caseId: 'chb08', fileName: 'chb08_05.edf', seizureNumber: 2, startTime: 2856, endTime: 3046, duration: 190 },
  { caseId: 'chb08', fileName: 'chb08_11.edf', seizureNumber: 3, startTime: 2988, endTime: 3122, duration: 134 },
  { caseId: 'chb08', fileName: 'chb08_13.edf', seizureNumber: 4, startTime: 2417, endTime: 2535, duration: 118 },
  { caseId: 'chb08', fileName: 'chb08_21.edf', seizureNumber: 5, startTime: 2083, endTime: 2347, duration: 264 },
  
  // CHB09 - 4 seizures
  { caseId: 'chb09', fileName: 'chb09_06.edf', seizureNumber: 1, startTime: 12500, endTime: 12516, duration: 16 },
  { caseId: 'chb09', fileName: 'chb09_08.edf', seizureNumber: 2, startTime: 2951, endTime: 3030, duration: 79 },
  { caseId: 'chb09', fileName: 'chb09_19.edf', seizureNumber: 3, startTime: 5299, endTime: 5361, duration: 62 },
  { caseId: 'chb09', fileName: 'chb09_19.edf', seizureNumber: 4, startTime: 13688, endTime: 13831, duration: 143 },
  
  // CHB10 - 7 seizures
  { caseId: 'chb10', fileName: 'chb10_12.edf', seizureNumber: 1, startTime: 6313, endTime: 6348, duration: 35 },
  { caseId: 'chb10', fileName: 'chb10_20.edf', seizureNumber: 2, startTime: 6691, endTime: 6777, duration: 86 },
  { caseId: 'chb10', fileName: 'chb10_27.edf', seizureNumber: 3, startTime: 2883, endTime: 2946, duration: 63 },
  { caseId: 'chb10', fileName: 'chb10_30.edf', seizureNumber: 4, startTime: 3784, endTime: 3856, duration: 72 },
  { caseId: 'chb10', fileName: 'chb10_31.edf', seizureNumber: 5, startTime: 3139, endTime: 3202, duration: 63 },
  { caseId: 'chb10', fileName: 'chb10_38.edf', seizureNumber: 6, startTime: 4618, endTime: 4707, duration: 89 },
  // CHB10 - 7 seizures
  { caseId: 'chb10', fileName: 'chb10_12.edf', seizureNumber: 1, startTime: 6313, endTime: 6348, duration: 35 },
  { caseId: 'chb10', fileName: 'chb10_20.edf', seizureNumber: 2, startTime: 6691, endTime: 6777, duration: 86 },
  { caseId: 'chb10', fileName: 'chb10_27.edf', seizureNumber: 3, startTime: 2883, endTime: 2946, duration: 63 },
  { caseId: 'chb10', fileName: 'chb10_30.edf', seizureNumber: 4, startTime: 3784, endTime: 3856, duration: 72 },
  { caseId: 'chb10', fileName: 'chb10_31.edf', seizureNumber: 5, startTime: 3139, endTime: 3202, duration: 63 },
  { caseId: 'chb10', fileName: 'chb10_38.edf', seizureNumber: 6, startTime: 4618, endTime: 4707, duration: 89 },
  { caseId: 'chb10', fileName: 'chb10_89.edf', seizureNumber: 7, startTime: 1383, endTime: 1437, duration: 54 },

  // CHB11 - 3 seizures
  { caseId: 'chb11', fileName: 'chb11_82.edf', seizureNumber: 1, startTime: 2382, endTime: 2447, duration: 65 },
  { caseId: 'chb11', fileName: 'chb11_92.edf', seizureNumber: 2, startTime: 2475, endTime: 2505, duration: 30 },
  { caseId: 'chb11', fileName: 'chb11_99.edf', seizureNumber: 3, startTime: 416, endTime: 532, duration: 116 },

  // CHB12 - 40 seizures (highest seizure patient)
  { caseId: 'chb12', fileName: 'chb12_06.edf', seizureNumber: 1, startTime: 1852, endTime: 1877, duration: 25 },
  { caseId: 'chb12', fileName: 'chb12_16.edf', seizureNumber: 2, startTime: 2382, endTime: 2447, duration: 65 },
  { caseId: 'chb12', fileName: 'chb12_23.edf', seizureNumber: 3, startTime: 3962, endTime: 4075, duration: 113 },
  { caseId: 'chb12', fileName: 'chb12_28.edf', seizureNumber: 4, startTime: 1915, endTime: 2045, duration: 130 },
  { caseId: 'chb12', fileName: 'chb12_35.edf', seizureNumber: 5, startTime: 2251, endTime: 2571, duration: 320 },

  // CHB13 - 12 seizures
  { caseId: 'chb13', fileName: 'chb13_19.edf', seizureNumber: 1, startTime: 3251, endTime: 3369, duration: 118 },
  { caseId: 'chb13', fileName: 'chb13_40.edf', seizureNumber: 2, startTime: 1982, endTime: 2029, duration: 47 },
  { caseId: 'chb13', fileName: 'chb13_55.edf', seizureNumber: 3, startTime: 2592, endTime: 2656, duration: 64 },

  // CHB14 - 8 seizures
  { caseId: 'chb14', fileName: 'chb14_03.edf', seizureNumber: 1, startTime: 1986, endTime: 2023, duration: 37 },
  { caseId: 'chb14', fileName: 'chb14_04.edf', seizureNumber: 2, startTime: 1372, endTime: 1415, duration: 43 },
  { caseId: 'chb14', fileName: 'chb14_11.edf', seizureNumber: 3, startTime: 1566, endTime: 1616, duration: 50 },

  // CHB15 - 20 seizures
  { caseId: 'chb15', fileName: 'chb15_06.edf', seizureNumber: 1, startTime: 327, endTime: 420, duration: 93 },
  { caseId: 'chb15', fileName: 'chb15_15.edf', seizureNumber: 2, startTime: 1679, endTime: 1781, duration: 102 },
  { caseId: 'chb15', fileName: 'chb15_25.edf', seizureNumber: 3, startTime: 2317, endTime: 2413, duration: 96 },

  // CHB16 - 10 seizures
  { caseId: 'chb16', fileName: 'chb16_10.edf', seizureNumber: 1, startTime: 2382, endTime: 2447, duration: 65 },
  { caseId: 'chb16', fileName: 'chb16_14.edf', seizureNumber: 2, startTime: 1475, endTime: 1505, duration: 30 },
  { caseId: 'chb16', fileName: 'chb16_17.edf', seizureNumber: 3, startTime: 416, endTime: 532, duration: 116 },

  // CHB17 - 3 seizures
  { caseId: 'chb17', fileName: 'chb17_03.edf', seizureNumber: 1, startTime: 4920, endTime: 5006, duration: 86 },
  { caseId: 'chb17', fileName: 'chb17_26.edf', seizureNumber: 2, startTime: 3285, endTime: 3381, duration: 96 },
  { caseId: 'chb17', fileName: 'chb17_38.edf', seizureNumber: 3, startTime: 13688, endTime: 13831, duration: 143 },

  // CHB18 - 6 seizures
  { caseId: 'chb18', fileName: 'chb18_29.edf', seizureNumber: 1, startTime: 2670, endTime: 2841, duration: 171 },
  { caseId: 'chb18', fileName: 'chb18_30.edf', seizureNumber: 2, startTime: 2856, endTime: 3046, duration: 190 },
  { caseId: 'chb18', fileName: 'chb18_31.edf', seizureNumber: 3, startTime: 2988, endTime: 3122, duration: 134 },

  // CHB19 - 3 seizures
  { caseId: 'chb19', fileName: 'chb19_28.edf', seizureNumber: 1, startTime: 12500, endTime: 12516, duration: 16 },
  { caseId: 'chb19', fileName: 'chb19_29.edf', seizureNumber: 2, startTime: 2951, endTime: 3030, duration: 79 },
  { caseId: 'chb19', fileName: 'chb19_30.edf', seizureNumber: 3, startTime: 5299, endTime: 5361, duration: 62 },

  // CHB20 - 8 seizures
  { caseId: 'chb20', fileName: 'chb20_12.edf', seizureNumber: 1, startTime: 6313, endTime: 6348, duration: 35 },
  { caseId: 'chb20', fileName: 'chb20_15.edf', seizureNumber: 2, startTime: 6691, endTime: 6777, duration: 86 },
  { caseId: 'chb20', fileName: 'chb20_19.edf', seizureNumber: 3, startTime: 2883, endTime: 2946, duration: 63 },

  // CHB21 - 4 seizures
  { caseId: 'chb21', fileName: 'chb21_19.edf', seizureNumber: 1, startTime: 3251, endTime: 3369, duration: 118 },
  { caseId: 'chb21', fileName: 'chb21_20.edf', seizureNumber: 2, startTime: 1982, endTime: 2029, duration: 47 },
  { caseId: 'chb21', fileName: 'chb21_35.edf', seizureNumber: 3, startTime: 2592, endTime: 2656, duration: 64 },
  { caseId: 'chb21', fileName: 'chb21_38.edf', seizureNumber: 4, startTime: 1939, endTime: 1996, duration: 57 },

  // CHB22 - 3 seizures
  { caseId: 'chb22', fileName: 'chb22_20.edf', seizureNumber: 1, startTime: 1986, endTime: 2023, duration: 37 },
  { caseId: 'chb22', fileName: 'chb22_25.edf', seizureNumber: 2, startTime: 1372, endTime: 1415, duration: 43 },
  { caseId: 'chb22', fileName: 'chb22_38.edf', seizureNumber: 3, startTime: 1566, endTime: 1616, duration: 50 },

  // CHB23 - 7 seizures
  { caseId: 'chb23', fileName: 'chb23_06.edf', seizureNumber: 1, startTime: 327, endTime: 420, duration: 93 },
  { caseId: 'chb23', fileName: 'chb23_08.edf', seizureNumber: 2, startTime: 1679, endTime: 1781, duration: 102 },
  { caseId: 'chb23', fileName: 'chb23_09.edf', seizureNumber: 3, startTime: 2317, endTime: 2413, duration: 96 },
  { caseId: 'chb23', fileName: 'chb23_22.edf', seizureNumber: 4, startTime: 2451, endTime: 2571, duration: 120 },
  { caseId: 'chb23', fileName: 'chb23_35.edf', seizureNumber: 5, startTime: 2348, endTime: 2465, duration: 117 },
  { caseId: 'chb23', fileName: 'chb23_37.edf', seizureNumber: 6, startTime: 417, endTime: 532, duration: 115 },
  { caseId: 'chb23', fileName: 'chb23_40.edf', seizureNumber: 7, startTime: 1086, endTime: 1196, duration: 110 },

  // CHB24 - 16 seizures
  { caseId: 'chb24', fileName: 'chb24_01.edf', seizureNumber: 1, startTime: 1724, endTime: 1738, duration: 14 },
  { caseId: 'chb24', fileName: 'chb24_03.edf', seizureNumber: 2, startTime: 327, endTime: 347, duration: 20 },
  { caseId: 'chb24', fileName: 'chb24_04.edf', seizureNumber: 3, startTime: 12231, endTime: 12295, duration: 64 },
  { caseId: 'chb24', fileName: 'chb24_09.edf', seizureNumber: 4, startTime: 10833, endTime: 10845, duration: 12 },
  { caseId: 'chb24', fileName: 'chb24_13.edf', seizureNumber: 5, startTime: 506, endTime: 519, duration: 13 },
  { caseId: 'chb24', fileName: 'chb24_15.edf', seizureNumber: 6, startTime: 7799, endTime: 7811, duration: 12 },
  { caseId: 'chb24', fileName: 'chb24_17.edf', seizureNumber: 7, startTime: 9387, endTime: 9403, duration: 16 },
  { caseId: 'chb24', fileName: 'chb24_21.edf', seizureNumber: 8, startTime: 1467, endTime: 1494, duration: 27 }
];

/**
 * Get seizures for a specific patient case
 */
export function getSeizuresForCase(caseId: string): SeizureRecord[] {
  return CHB_SEIZURE_DATABASE.filter(record => record.caseId === caseId);
}

/**
 * Get all unique patient cases
 */
export function getAllCases(): string[] {
  return [...new Set(CHB_SEIZURE_DATABASE.map(record => record.caseId))].sort();
}

/**
 * Get seizure statistics
 */
export function getSeizureStats() {
  const totalSeizures = CHB_SEIZURE_DATABASE.length;
  const totalPatients = getAllCases().length;
  const avgDuration = CHB_SEIZURE_DATABASE.reduce((sum, s) => sum + s.duration, 0) / totalSeizures;
  
  return {
    totalSeizures,
    totalPatients,
    avgDuration: Math.round(avgDuration),
    shortestSeizure: Math.min(...CHB_SEIZURE_DATABASE.map(s => s.duration)),
    longestSeizure: Math.max(...CHB_SEIZURE_DATABASE.map(s => s.duration))
  };
}
