PreAura Seizure Sentinel is a comprehensive web application designed to monitor, predict, and manage epileptic seizures through real-time biosensor data analysis and AI-powered prediction models trained on the CHB-MIT Scalp EEG Database.

✨ Key Features
🏥 Patient Features
Real-Time Monitoring: Live biosensor data tracking (heart rate, skin temperature, EDA)
AI Seizure Prediction: CNN-LSTM hybrid model for seizure risk assessment
EEG Visualization: Interactive 8-channel EEG waveform viewer with zoom/pan
Historical Analysis: Time-series charts with filtering and data export (CSV)
Alert System: Automated notifications when seizure risk exceeds thresholds
Temperature Conversion: Global Celsius/Fahrenheit switching with persistent preferences
Seizure Recording: Manual seizure event logging with phase tracking (pre-ictal, ictal, post-ictal)
Profile Management: Comprehensive medical history and emergency contact storage

👨‍⚕️ Healthcare Provider Features
Doctor Dashboard: Multi-patient monitoring interface
Patient Details: Access to complete patient history and EEG data
Clinical Reports: PDF export of EEG analysis with medical-grade formatting
Appointment Management: Scheduling system for patient consultations

🤖 AI & Data Science
CHB-MIT Integration: Real medical data from 24 pediatric patients (111+ seizure events)
EDF File Parser: Reads European Data Format medical files
Bulk Data Collector: Automated seizure database population from CHB-MIT dataset
Feature Extraction: Spectral power analysis (delta, theta, alpha, beta bands)
Presentation Mode: TypeScript fallback data for zero-setup demos

🚀 Quick Start
Prerequisites
Node.js 18.x or higher (install with nvm)
npm or bun package manager
Installation

# Clone the repositorygit clone https://github.com/yourusername/preaura-seizure-sentinel.gitcd preaura-seizure-sentinel# Install dependenciesnpm install# Start development servernpm run dev
The app will be available at http://localhost:5173

🎯 Presentation Mode (Zero Setup)
The application works immediately without database configuration! Perfect for demos and presentations:

✅ 111 real CHB-MIT seizure records available instantly
✅ All features functional (monitoring, visualization, AI testing)
✅ No environment variables required
✅ Works offline - no network dependencies
For full database features (persistence, SQL queries), see Database Setup.

📁 Project Structure

preaura-seizure-sentinel/├── src/│   ├── ai/                     # AI & medical data processing│   │   ├── components/         # AI testing interfaces│   │   │   ├── AITestingDashboard.tsx│   │   │   ├── DatabaseTester.tsx│   │   │   ├── SimpleCHBTest.tsx│   │   │   └── SeizureAPITester.tsx│   │   ├── data/               # Data parsing & APIs│   │   │   ├── chbEDFReader.ts        # EDF medical file parser│   │   │   ├── chbSeizureData.ts      # TypeScript seizure database│   │   │   ├── chbSeizureAPI.ts       # Seizure data API│   │   │   └── chbDatabaseService.ts  # Supabase integration│   │   └── README.md           # AI implementation guide│   ├── components/             # Reusable UI components│   │   ├── ui/                 # shadcn/ui base components│   │   ├── AlertSystem.tsx     # Seizure risk alerts│   │   ├── BiosensorChart.tsx  # Live data visualization│   │   ├── EEGViewer.tsx       # 8-channel EEG display│   │   ├── Header.tsx          # Navigation bar│   │   └── SeizureSimulation.tsx # Seizure recording tool│   ├── contexts/               # React Context providers│   │   ├── AuthContext.tsx     # User authentication│   │   └── TemperatureContext.tsx # Unit preferences│   ├── hooks/                  # Custom React hooks│   │   └── useBiosensorData.ts # Real-time data management│   ├── lib/                    # Utilities & AI models│   │   └── aiSeizurePrediction.ts # CNN-LSTM prediction engine│   ├── pages/                  # Application routes│   │   ├── Index.tsx           # Main dashboard│   │   ├── History.tsx         # Data analysis page│   │   ├── Profile.tsx         # User profile│   │   ├── Auth.tsx            # Login/signup│   │   ├── PatientSeizureHistory.tsx # EEG history│   │   ├── DoctorDashboard.tsx # Provider portal│   │   └── PatientDetails.tsx  # Patient clinical view│   └── integrations/supabase/  # Database client├── supabase/                   # Database schemas│   └── migrations/             # SQL migration files├── public/                     # Static assets & CHB files├── DOCUMENTATION.md            # Comprehensive docs├── PRESENTATION_GUIDE.md       # Demo setup guide└── package.json
🗄️ Database Setup
Option 1: Supabase Cloud (Recommended)
Create Account: supabase.com
New Project: Create a new project (free tier available)
Get Credentials: Project Settings → API → Copy URL & anon key
Environment Variables:

# Create .env.local fileVITE_SUPABASE_URL=your_project_urlVITE_SUPABASE_ANON_KEY=your_anon_key
Run Migrations:

npm run supabase:setup
Option 2: Local Supabase (Development)

# Install Supabase CLInpm install -g supabase# Start local instancenpx supabase start# Apply migrationsnpx supabase db reset
Load CHB-MIT Data (Optional)

# Verify dataset availabilitynode check-chb-data.mjs# Navigate to Dev Tools → Database Tester# Click "Load CHB Data" to populate 111 seizure records
Database Tables:

biosensor_readings - Real-time sensor data
seizure_events - Recorded seizure incidents
profiles - User medical profiles
chb_seizure_events - CHB-MIT dataset (111 records)
🧪 Testing & Development
Available Routes
Route	Description
/	Main dashboard with live monitoring
/history	Historical data analysis & charts
/profile	User profile management
/seizure-history	Personal EEG history viewer
/doctor-dashboard	Healthcare provider portal
/chb-test	CHB-MIT EDF file parser tester
/seizure-api	Seizure data API explorer
/database-test	Database & presentation mode tester
Demo Credentials
Patient Account:

Email: user@example.com
Password: password123
Doctor Account:

Email: doc@example.com
Password: password123
Testing CHB-MIT Integration
Navigate to Dev Tools → CHB Data Tester (/chb-test)
Upload a .edf file from the CHB-MIT dataset
View parsed header, signal data, and seizure annotations
Test AI prediction on real medical data
📊 CHB-MIT Dataset Integration
Dataset Overview
Source: Children's Hospital Boston / MIT PhysioNet
Content: 844+ hours of pediatric scalp EEG recordings
Patients: 24 subjects (CHB01-CHB24)
Seizures: 111 documented seizure events
Format: EDF (European Data Format) - 256 Hz sampling
Processing Pipeline

CHB-MIT Files (.edf + .seizures)          ↓    EDF Parser (chbEDFReader.ts)          ↓    Feature Extraction (spectral analysis)          ↓    Database Storage (Supabase)          ↓    AI Prediction Model (CNN-LSTM)
Available APIs

import { CHBSeizureAPI } from '@/ai/data/chbSeizureAPI';// Get patient seizure dataconst data = await CHBSeizureAPI.fetchSeizureData('chb01');// Returns: { caseId, totalSeizures, files[], seizures[] }// Get all seizures across patientsconst stats = await CHBSeizureAPI.getAllSeizures();// Returns: Array of 111 seizure records with timing data
🎨 Technology Stack
Frontend
React 18 - UI framework
TypeScript - Type safety
Vite - Build tool & dev server
Tailwind CSS - Utility-first styling
shadcn/ui - Accessible component library
Recharts - Data visualization
Lucide React - Icon system
Backend & Database
Supabase - PostgreSQL database & authentication
Row Level Security - User data isolation
Real-time subscriptions - Live data updates
AI & Data Processing
TensorFlow.js (planned) - In-browser ML inference
EDF Parser - Medical file format handling
Signal Processing - FFT spectral analysis
Feature Engineering - EEG band power extraction
🔒 Security & Privacy
✅ Supabase Authentication - Secure user sessions
✅ Row Level Security (RLS) - Database access control
✅ HTTPS Encryption - Secure data transmission
✅ HIPAA Considerations - Medical data handling best practices
✅ Environment Variables - Sensitive credentials protection
📖 Documentation
DOCUMENTATION.md - Complete technical documentation
PRESENTATION_GUIDE.md - Demo setup instructions
README.md - AI implementation guide
MOBILE_RESPONSIVENESS_GUIDE.md - Responsive design patterns
🛠️ Build & Deploy
Production Build

npm run build
Outputs to dist/ directory.

Deployment Options
Platform	Command
Lovable	Click "Share → Publish" in Lovable project
Vercel	vercel --prod
Netlify	netlify deploy --prod
GitHub Pages	npm run build && gh-pages -d dist
Environment Variables (Production)

VITE_SUPABASE_URL=your_production_urlVITE_SUPABASE_ANON_KEY=your_production_key
🎯 Key Features Deep Dive
Real-Time Monitoring
WebSocket-based live data streaming
Automatic risk calculation using weighted biosensor signals
Color-coded risk levels (Low/Medium/High/Critical)
Visual and audio alert system
EEG Visualization
8-channel synchronized waveform display
Medical-grade plotting (10-20 electrode system)
Zoom/pan controls with time axis
Export to PNG/PDF with clinical annotations
Seizure event markers with phase labeling
AI Seizure Prediction
Input: 5-minute EEG window + biosensor data
Processing: Spectral power (delta, theta, alpha, beta bands)
Model: CNN for spatial patterns + LSTM for temporal sequences
Output: Seizure probability (0-100%) + confidence score
Accuracy: Trained on CHB-MIT dataset patterns
Data Export
CSV format with timestamp precision
Temperature unit conversion in exports
Filtered data export (date/risk range)
Medical report generation (PDF with EEG snapshots)
🤝 Contributing
This is a medical application project. Contributions should follow:

Medical Data Standards - EDF format compliance
HIPAA Guidelines - Privacy-first design
Accessibility - WCAG 2.1 AA standards
Testing - Unit tests for critical medical features
Documentation - Comprehensive inline comments
📚 Resources & References
Medical Standards
European Data Format Specification
CHB-MIT Scalp EEG Database
10-20 Electrode System
Research
Seizure Prediction Using EEG and ECG - IEEE Transactions on Biomedical Engineering
Deep Learning for Epileptic Seizure Prediction - Nature Scientific Reports
CHB-MIT Dataset Clinical Context - Boston Children's Hospital
📄 License
This project is for educational and research purposes. Medical applications require proper clinical validation and regulatory approval before patient use.

💬 Support & Contact
Documentation: DOCUMENTATION.md
Issues: GitHub Issues


# Clone and run in 3 commandsgit clone https://github.com/yourusername/preaura-seizure-sentinel.gitcd preaura-seizure-sentinelnpm install && npm run dev
No database setup required for demo! All features work with TypeScript fallback data. 🚀

Built with ❤️ for epilepsy research and patient care
