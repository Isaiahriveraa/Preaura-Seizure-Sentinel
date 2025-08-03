// Mock patient data with seizure events and EEG information
export interface SeizureEvent {
  id: string;
  date: string;
  time: string;
  duration: number; // in seconds
  severity: 'mild' | 'moderate' | 'severe';
  type: 'focal' | 'generalized' | 'unknown';
  eegImageUrl: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  epilepyType: string;
  lastSeizure: string;
  riskLevel: 'low' | 'medium' | 'high';
  seizureEvents: SeizureEvent[];
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
  };
}

// Mock EEG images (we'll create placeholder URLs for now)
const generateEEGImageUrl = (patientId: string, seizureId: string) => 
  `/eeg/${patientId}_seizure_${seizureId}.png`;

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient-001',
    name: 'Emily Rodriguez',
    age: 28,
    epilepyType: 'Temporal Lobe Epilepsy',
    lastSeizure: '2025-07-28',
    riskLevel: 'high',
    contactInfo: {
      phone: '(555) 123-4567',
      email: 'emily.r@email.com',
      emergencyContact: 'Miguel Rodriguez (555) 123-4568'
    },
    seizureEvents: [
      {
        id: 'seizure-001',
        date: '2025-07-28',
        time: '14:32',
        duration: 120,
        severity: 'moderate',
        type: 'focal',
        eegImageUrl: generateEEGImageUrl('patient-001', 'seizure-001'),
        notes: 'Patient reported aura 5 minutes before onset. Quick recovery.'
      },
      {
        id: 'seizure-002',
        date: '2025-07-25',
        time: '09:15',
        duration: 90,
        severity: 'mild',
        type: 'focal',
        eegImageUrl: generateEEGImageUrl('patient-001', 'seizure-002'),
        notes: 'Sleep-related seizure. No complications.'
      },
      {
        id: 'seizure-003',
        date: '2025-07-20',
        time: '16:45',
        duration: 180,
        severity: 'severe',
        type: 'generalized',
        eegImageUrl: generateEEGImageUrl('patient-001', 'seizure-003'),
        notes: 'Tonic-clonic seizure. Required intervention.'
      }
    ]
  },
  {
    id: 'patient-002',
    name: 'Michael Chen',
    age: 34,
    epilepyType: 'Frontal Lobe Epilepsy',
    lastSeizure: '2025-07-30',
    riskLevel: 'medium',
    contactInfo: {
      phone: '(555) 234-5678',
      email: 'mchen@email.com',
      emergencyContact: 'Lisa Chen (555) 234-5679'
    },
    seizureEvents: [
      {
        id: 'seizure-004',
        date: '2025-07-30',
        time: '22:18',
        duration: 45,
        severity: 'mild',
        type: 'focal',
        eegImageUrl: generateEEGImageUrl('patient-002', 'seizure-004'),
        notes: 'Nocturnal seizure. Brief motor symptoms.'
      },
      {
        id: 'seizure-005',
        date: '2025-07-26',
        time: '13:30',
        duration: 75,
        severity: 'moderate',
        type: 'focal',
        eegImageUrl: generateEEGImageUrl('patient-002', 'seizure-005'),
        notes: 'Complex partial seizure with automatisms.'
      }
    ]
  },
  {
    id: 'patient-003',
    name: 'Sarah Williams',
    age: 19,
    epilepyType: 'Juvenile Myoclonic Epilepsy',
    lastSeizure: '2025-08-01',
    riskLevel: 'low',
    contactInfo: {
      phone: '(555) 345-6789',
      email: 'sarah.w@email.com',
      emergencyContact: 'Robert Williams (555) 345-6790'
    },
    seizureEvents: [
      {
        id: 'seizure-006',
        date: '2025-08-01',
        time: '07:45',
        duration: 30,
        severity: 'mild',
        type: 'generalized',
        eegImageUrl: generateEEGImageUrl('patient-003', 'seizure-006'),
        notes: 'Morning myoclonic jerks. Typical pattern.'
      },
      {
        id: 'seizure-007',
        date: '2025-07-29',
        time: '08:10',
        duration: 25,
        severity: 'mild',
        type: 'generalized',
        eegImageUrl: generateEEGImageUrl('patient-003', 'seizure-007'),
        notes: 'Similar pattern to previous events.'
      }
    ]
  }
];

// Helper functions
export const getPatientById = (id: string): Patient | undefined => {
  return MOCK_PATIENTS.find(patient => patient.id === id);
};

export const getSeizureEventById = (patientId: string, seizureId: string): SeizureEvent | undefined => {
  const patient = getPatientById(patientId);
  return patient?.seizureEvents.find(seizure => seizure.id === seizureId);
};

export const formatSeizureDate = (date: string, time: string): string => {
  const seizureDate = new Date(`${date}T${time}`);
  return seizureDate.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRiskLevelColor = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe'): string => {
  switch (severity) {
    case 'mild': return 'text-green-600 bg-green-100';
    case 'moderate': return 'text-yellow-600 bg-yellow-100';
    case 'severe': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};
