# PreAura AI Implementation Context & Plan

## 📋 **Project Overview**
PreAura uses a hybrid deep learning model (CNN + LSTM) to predict seizures by analyzing EEG and biosignal data patterns.

## 🧠 **AI Architecture Goals**
- **CNNs (Convolutional Neural Networks)**: Detect spatial patterns in EEG spectrograms
- **LSTMs (Long Short-Term Memory)**: Track temporal sequences in biosensor data
- **Hybrid Model**: Combine spatial and temporal analysis for seizure prediction
- **Training Data**: Real CHB-MIT dataset + synthetic data for diversity

## 📊 **CHB-MIT Dataset Context**

### **Dataset Details:**
- **Source**: CHB-MIT Scalp EEG Database from PhysioNet
- **Total Size**: 42.6 GB (664 files from 22 pediatric patients)
- **Seizure Files**: 129 files containing actual seizure events
- **Format**: EDF (European Data Format) - medical standard for EEG storage
- **Sampling Rate**: 256 samples per second, 16-bit resolution
- **Channels**: 23 EEG signals using International 10-20 electrode system

### **File Structure:**
```
CHB-MIT Dataset:
├── RECORDS-WITH-SEIZURES (129 files containing seizures)
├── chb01/ (Patient 1 files)
│   ├── chb01_03.edf (Raw EEG recording)
│   ├── chb01_03.edf.seizures (Binary seizure annotations)
│   └── chb01-summary.txt (Human-readable seizure info)
├── chb02/ (Patient 2 files)
...
└── SUBJECT-INFO (Patient demographics)
```

### **Current Downloaded Files:**
- **chb01_03.edf**: Raw EEG recording from patient chb01, session 03
- **chb01_03.edf.seizures**: Seizure timing annotations for above file

## 🎯 **Implementation Strategy**

### **Phase 1: EDF File Reader**
**Goal**: Parse real CHB-MIT EDF files to extract EEG data
**Location**: `/src/ai/data/edfReader.ts`
**Purpose**: Convert binary EDF format to usable EEG data for AI training

### **Phase 2: Seizure Annotation Parser**
**Goal**: Extract seizure timing from .seizures files
**Location**: `/src/ai/data/seizureAnnotationParser.ts`
**Purpose**: Get exact start/end times for seizure events

### **Phase 3: Feature Extraction**
**Goal**: Convert raw EEG to AI training features
**Location**: `/src/ai/processing/featureExtractor.ts`
**Purpose**: Extract spatial and temporal features for CNN/LSTM training

### **Phase 4: Database Integration**
**Goal**: Store processed features in Supabase
**Schema**: 
```sql
-- CHB subjects table
CREATE TABLE chb_subjects (
  id SERIAL PRIMARY KEY,
  case_id TEXT UNIQUE NOT NULL,
  age INTEGER,
  gender TEXT,
  total_seizures INTEGER
);

-- Processed seizure events
CREATE TABLE chb_seizure_events (
  id SERIAL PRIMARY KEY,
  case_id TEXT REFERENCES chb_subjects(case_id),
  file_name TEXT NOT NULL,
  seizure_start_seconds INTEGER,
  seizure_end_seconds INTEGER,
  features JSONB, -- Extracted AI features
  metadata JSONB -- Additional context
);
```

## 🔧 **Technical Specifications**

### **EDF File Format:**
- **Header**: First 256 bytes (ASCII text fields)
- **Signal Info**: Variable length (256 bytes per signal)
- **Data Records**: Binary data records with signal samples
- **Conversion**: Digital values → Physical values using calibration

### **Integration with Existing Code:**
- **No Website Impact**: AI module is completely separate
- **EEGViewer Enhancement**: Can optionally display real CHB-MIT data
- **Database Safe**: Features only (~1KB per seizure vs 1GB raw data)
- **Development Only**: EDF processing runs locally, not in production

## 📚 **Learning Objectives**
1. **Medical Data Formats**: Understanding EDF structure and parsing
2. **Signal Processing**: Converting raw EEG to meaningful features
3. **Machine Learning Pipeline**: Real data → Features → Training → Prediction
4. **Data Engineering**: Handling large medical datasets efficiently

## 🚀 **Next Steps**
1. **Create EDF Reader** using downloaded chb01_03.edf file
2. **Parse Seizure Annotations** from chb01_03.edf.seizures file
3. **Extract Features** from seizure segments
4. **Test Integration** with existing EEGViewer component
5. **Scale to Full Dataset** once proof-of-concept works

## ⚠️ **Important Notes**
- **File Safety**: CHB files are local development only
- **Website Separation**: AI module doesn't affect main application
- **Incremental Approach**: Start with 1-2 files, then scale up
- **Real Data**: This enables training with actual medical seizure patterns
