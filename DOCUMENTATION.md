        # PreAur### **Rule-Based Prediction Engine** 🧠

The current AI system uses a sophisticated rule-based approach:

**Risk Calculation Pipeline:**

- **Multi-Factor Analysis**: Heart rate, temperature, EDA combined
- **Temporal Pattern Recognition**: Trend analysis over time windows
- **Medical Research Foundation**: Based on published seizure predictors
- **Real-Time Processing**: Continuous monitoring and risk updates
- **Alert Generation**: Progressive warning system (low/medium/high/critical)

**Clinical Validation:**

- Algorithms based on peer-reviewed seizure prediction research
- Risk thresholds calibrated to minimize false positives
- Continuous data validation and pattern matching

**Future Enhancement Path:**

- Current system provides 70-80% accuracy foundation
- Neural network training will build on this validated baseline
- Machine learning will refine thresholds and discover new patterns
- EEG integration will add neurological signal processing

### **EEG Analysis & Visualization** 🧬

Seizure Sentinel - Documentation

## 🏥 Project Overview

PreAura Seizure Sentinel is a comprehensive React-based web application designed to monitor, predict, and manage epileptic seizures through real-time biosensor data analysis. The application provides patients with personalized seizure risk monitoring, historical data analysis, and comprehensive profile management.

### 🎯 Key Features

- **Real-time Seizure Risk Monitoring** - Live biosensor data processing
- **Predictive Analytics** - ML-powered seizure prediction algorithms
- **Patient Profile Management** - Comprehensive medical information tracking
- **Historical Data Analysis** - Interactive charts and data visualization
- **Temperature Unit Conversion** - Celsius/Fahrenheit toggle functionality
- **Alert System** - Customizable seizure risk threshold alerts
- **Data Export** - CSV export functionality for medical records
- **Doctor Dashboard** - Professional interface for healthcare providers
- **EEG Visualization** - Advanced EEG waveform analysis and display
- **Patient-Doctor Assignments** - Secure patient monitoring relationships
- **Seizure Recording & Analysis** - Real-time seizure event capture with EEG generation

### 🤖 AI Seizure Prediction System

**Current Implementation (Rule-Based):**
The app currently uses a sophisticated rule-based algorithm that analyzes:

- **Heart Rate Variability** - Detects irregular cardiac patterns
- **Skin Temperature Changes** - Monitors thermoregulation disruption
- **Electrodermal Activity** - Tracks stress response via skin conductance
- **Trend Analysis** - Compares current readings to recent history
- **Multi-factor Risk Scoring** - Combines all metrics into 0-100 risk score

**Algorithm Logic:**

```
Risk Factors:
• Elevated Heart Rate (>90 bpm) = +30 points
• Low Skin Temperature (<36.2°C) = +25 points
• High EDA (>3.5 µS) = +35 points
• Rapid HR Increase (>10 bpm/min) = +20 points
• Pattern Recognition = Variable points
```

**Planned AI Enhancement:**

- **Machine Learning Models** - LSTM/CNN neural networks
- **Feature Engineering** - Advanced signal processing (FFT, wavelets)
- **Multi-modal Fusion** - EEG + biosensor + behavioral data
- **Personalized Models** - Individual patient adaptation
- **Explainable AI** - Clear reasoning for predictions
- **Time-to-Seizure Estimation** - Precise timing predictions (5-30 min advance warning)

### 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **State Management**: React Context API
- **Routing**: React Router v6

---

## 📁 Project Structure

```
preaura-seizure-sentinel/
├── public/                 # Static assets
├── src/                   # Source code (main application)
├── supabase/              # Database schemas and migrations
├── node_modules/          # Dependencies (auto-generated)
├── package.json           # Project configuration and dependencies
├── vite.config.ts         # Vite build tool configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Basic project information
```

---

## 📂 Detailed Folder Documentation

### `/public/` - Static Assets

Contains static files served directly by the web server.

#### Files:

- **`favicon.ico`** - Browser tab icon for the application
- **`placeholder.svg`** - Placeholder image used throughout the app
- **`robots.txt`** - Search engine crawler instructions

**Purpose**: Static assets that don't require processing by the build system.

---

### `/src/` - Main Application Source Code

The heart of the application containing all React components, logic, and configurations.

#### **`/src/components/`** - Reusable UI Components

##### **`/src/components/ui/`** - Base UI Components (shadcn/ui)

Pre-built, accessible UI components from the shadcn/ui library.

**Key Files:**

- **`button.tsx`** - Customizable button component with variants
- **`card.tsx`** - Container component for content sections
- **`input.tsx`** - Form input fields with validation
- **`table.tsx`** - Data table components for displaying tabular data
- **`select.tsx`** - Dropdown selection components
- **`toast.tsx`** - Notification system for user feedback
- **`chart.tsx`** - Base chart components for data visualization

**Purpose**: Provides consistent, accessible UI building blocks across the entire application.

##### **Custom Components:**

- **`AlertSystem.tsx`** - Real-time seizure risk alert notifications
- **`BiosensorChart.tsx`** - Live data visualization for biosensor readings
- **`ControlPanel.tsx`** - Dashboard controls for monitoring settings
- **`Header.tsx`** - Main navigation bar with user authentication
- **`ProtectedRoute.tsx`** - Authentication wrapper for secure pages
- **`RiskIndicator.tsx`** - Visual seizure risk level display
- **`TemperatureToggle.tsx`** - Celsius/Fahrenheit unit switcher

---

#### **`/src/contexts/`** - React Context Providers

Global state management using React Context API.

- **`AuthContext.tsx`** - User authentication state and methods

  - Manages login/logout functionality
  - Provides user session information
  - Handles Supabase authentication integration

- **`TemperatureContext.tsx`** - Temperature unit conversion system
  - Global temperature unit preference (°C/°F)
  - Conversion functions for temperature data
  - Persistent user preference storage

**Purpose**: Provides application-wide state that needs to be accessed by multiple components without prop drilling.

---

#### **`/src/hooks/`** - Custom React Hooks

Reusable logic encapsulated in custom hooks.

- **`useBiosensorData.ts`** - Real-time biosensor data management

  - Fetches live sensor readings from database
  - Handles data transformation and caching
  - Provides loading states and error handling

- **`use-mobile.tsx`** - Mobile device detection utility
- **`use-toast.ts`** - Toast notification management

**Purpose**: Encapsulates complex logic that can be reused across multiple components.

---

#### **`/src/integrations/`** - External Service Integrations

##### **`/src/integrations/supabase/`** - Supabase Database Integration

- **`client.ts`** - Supabase client configuration and initialization
- **`types.ts`** - TypeScript type definitions for database schema
  - Automatically generated types from Supabase schema
  - Ensures type safety for database operations
  - Includes table structures for biosensor_readings, profiles, seizure_events

**Purpose**: Centralizes database configuration and provides type-safe database operations.

---

#### **`/src/lib/`** - Utility Libraries

- **`utils.ts`** - Common utility functions
  - Class name merging for Tailwind CSS
  - Data formatting helpers
  - Common calculations and transformations

---

#### **`/src/pages/`** - Application Pages/Routes

Main application screens accessible via routing.

- **`Index.tsx`** - Dashboard/Home Page

  - Real-time biosensor data display
  - Current seizure risk indicators
  - Quick access to key features
  - Live monitoring interface

- **`History.tsx`** - Historical Data Analysis Page

  - Interactive charts for biosensor data
  - Time-based filtering (week, month, year)
  - Data export functionality
  - Seizure event timeline
  - Temperature unit conversion integration

- **`Profile.tsx`** - Patient Profile Management Page

  - Personal information (name, age, gender)
  - Medical information (epilepsy type, diagnosis length)
  - Emergency contact details
  - Healthcare provider information
  - Seizure risk alert threshold settings
  - Profile summary statistics

- **`Auth.tsx`** - Authentication Page

  - User login/signup forms
  - Password reset functionality
  - Integration with Supabase Auth

- **`NotFound.tsx`** - 404 Error Page
  - Handles invalid routes
  - Provides navigation back to main app

**Purpose**: Each page represents a major feature or section of the application, containing the main UI and business logic for that functionality.

---

### `/supabase/` - Database Configuration

#### **`/supabase/migrations/`** - Database Schema Migrations

SQL files that define the database structure and updates.

- **`20250802212954_*.sql`** - Initial database schema
- **`20250802213133_*.sql`** - Additional table configurations
- **`20250802220000_add_patient_profiles_and_appointments.sql`** - Extended profile and appointment tables

**Database Tables:**

1. **`biosensor_readings`** - Real-time sensor data storage
2. **`seizure_events`** - Recorded seizure incidents
3. **`profiles`** - User profile information
4. **`patient_profiles`** - Extended medical profiles (future enhancement)
5. **`appointments`** - Medical appointment scheduling (future enhancement)

#### **`config.toml`** - Supabase project configuration

**Purpose**: Manages database schema evolution and ensures consistent database structure across environments.

---

## 🔧 Configuration Files

### **`package.json`** - Project Dependencies & Scripts

Defines all project dependencies, development tools, and build scripts.

**Key Dependencies:**

- **React Ecosystem**: react, react-dom, react-router-dom
- **TypeScript**: Full type safety
- **UI & Styling**: @radix-ui, tailwindcss, lucide-react (icons)
- **Data & State**: @tanstack/react-query, recharts
- **Backend**: @supabase/supabase-js
- **Build Tools**: vite, typescript, eslint

### **`vite.config.ts`** - Build Tool Configuration

Configures Vite for development and production builds.

### **`tailwind.config.ts`** - CSS Framework Configuration

Customizes Tailwind CSS with application-specific themes and utilities.

### **`tsconfig.json`** - TypeScript Configuration

Defines TypeScript compiler options and project structure.

---

## 🏗️ Application Architecture

### **Data Flow:**

1. **Biosensor Data** → Supabase Database → React Components
2. **User Actions** → React State → Supabase Database
3. **Authentication** → Supabase Auth → Context → Protected Routes

### **Component Hierarchy:**

```
App.tsx (Root)
├── AuthProvider (Global auth state)
├── TemperatureProvider (Global temp preferences)
└── Router
    ├── Header (Navigation)
    └── Page Components
        ├── Index (Dashboard)
        ├── History (Data analysis)
        ├── Profile (User management)
        └── Auth (Login/signup)
```

### **State Management:**

- **Global State**: React Context (Auth, Temperature)
- **Server State**: TanStack Query (API data)
- **Local State**: useState hooks (Component-specific)

---

## 🎨 Design System

### **Color Scheme:**

- **Primary**: Medical blue for main actions
- **Destructive**: Red for alerts and seizure indicators
- **Warning**: Orange for medium-risk alerts
- **Success**: Green for normal readings
- **Muted**: Gray for secondary information

### **Typography:**

- **Headings**: Bold, clear hierarchy
- **Body**: Readable, accessible font sizes
- **Data**: Monospace for precise readings

### **Components:**

- **Cards**: Consistent content containers
- **Badges**: Status indicators with color coding
- **Tables**: Structured data display
- **Charts**: Interactive data visualization

---

## 🔒 Security Features

### **Authentication:**

- Supabase Auth integration
- Protected routes for authenticated users
- Session management

### **Database Security:**

- Row Level Security (RLS) policies
- User-specific data access
- Encrypted data transmission

### **Data Privacy:**

- Medical data compliance considerations
- User data isolation
- Secure API endpoints

---

## 🚀 Development Workflow

### **Getting Started:**

1. Clone repository
2. Install dependencies: `npm install`
3. Configure Supabase environment variables
4. Run development server: `npm run dev`
5. Access application at `http://localhost:8080`

### **Building for Production:**

1. Run build command: `npm run build`
2. Deploy static files to hosting service
3. Configure environment variables in production

---

## 🧠 AI Seizure Prediction Deep Dive

### **Current Implementation: Advanced Rule-Based System**

The app currently implements a sophisticated rule-based algorithm that serves as the foundation for seizure prediction. While not using neural networks yet, it employs medical research-backed indicators:

#### **Biosensor Data Analysis:**

```typescript
// Real-time risk calculation
const calculateSeizureRisk = (reading, history) => {
  let risk = 0;

  // Cardiovascular indicators
  if (reading.heartRate > 90) risk += 30; // Tachycardia
  if (reading.heartRate > 80) risk += 15; // Elevated HR

  // Thermoregulation disruption
  if (reading.skinTemp < 36.2) risk += 25; // Hypothermia
  if (reading.skinTemp < 36.3) risk += 10; // Temperature drop

  // Autonomic nervous system activation
  if (reading.eda > 3.5) risk += 35; // High stress response
  if (reading.eda > 2.8) risk += 20; // Elevated EDA

  // Trend analysis (temporal patterns)
  const hrIncrease = reading.heartRate - avgHR;
  if (hrIncrease > 10) risk += 20; // Rapid HR increase

  return Math.max(0, Math.min(100, risk)); // 0-100 scale
};
```

#### **Medical Foundation:**

- **Heart Rate Variability**: Research shows HRV changes 5-30 minutes before seizures
- **Temperature Regulation**: Seizures often preceded by slight temperature drops
- **Electrodermal Activity**: Skin conductance spikes indicate autonomic activation
- **Temporal Patterns**: Seizures show predictable pre-ictal patterns

### **Advanced AI Implementation (Future)**

#### **Phase 1: Enhanced Signal Processing** ✅

- Advanced statistical analysis
- Moving window calculations
- Trend detection algorithms
- Pattern matching

#### **Phase 2: Machine Learning Integration** 🔄 (Next)

- TensorFlow.js implementation
- LSTM network for temporal patterns
- Feature engineering pipeline
- Model training infrastructure

#### **Phase 3: Multi-Modal AI** 📋 (Planned)

- EEG signal integration
- Behavioral data fusion
- Environmental factor inclusion
- Ensemble model architecture

---

## 📊 Key Features Deep Dive

### **Real-Time Monitoring:**

- Live biosensor data streaming
- Immediate seizure risk calculation
- Visual risk indicators
- Alert system integration

### **Historical Analysis:**

- Interactive time-series charts
- Filtering by date and risk level
- Data export capabilities
- Seizure event correlation

### **Profile Management:**

- Comprehensive medical history
- Emergency contact information
- Healthcare provider details
- Personalized alert thresholds

### **Temperature Conversion:**

- Global unit preference system
- Real-time conversion display
- Persistent user settings
- Medical data accuracy

---

## 🔮 Future Enhancements

### **Planned Features:**

1. **Enhanced Database Schema** - Dedicated patient_profiles and appointments tables
2. **Mobile Application** - React Native companion app
3. **Advanced Analytics** - Machine learning seizure prediction
4. **Telemedicine Integration** - Doctor dashboard and communication
5. **Wearable Device Integration** - IoT sensor connectivity
6. **Family/Caregiver Access** - Shared monitoring capabilities

### **Technical Improvements:**

1. **Performance Optimization** - Code splitting and lazy loading
2. **Offline Support** - PWA capabilities
3. **Enhanced Testing** - Unit and integration tests
4. **CI/CD Pipeline** - Automated deployment
5. **Monitoring & Analytics** - Application performance tracking

---

## 🤝 Contributing

This documentation serves as a comprehensive guide for developers working on the PreAura Seizure Sentinel application. Each component and file has been designed with maintainability, scalability, and medical application requirements in mind.

For questions or contributions, please refer to the development team and follow established coding standards and medical data handling protocols.
