import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TemperatureProvider } from "@/contexts/TemperatureContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import History from "./pages/History";
import Profile from "./pages/Profile";
import PatientSeizureHistory from "./pages/PatientSeizureHistory";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDetails from "./pages/PatientDetails";
import NotFound from "./pages/NotFound";
import { SimpleCHBTest } from "./ai/components/SimpleCHBTest";
import { SeizureAPITester } from "./ai/components/SeizureAPITester";
import { BulkSeizureCollector } from "./ai/components/BulkSeizureCollector";
import { DatabaseTester } from "./ai/components/DatabaseTester";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TemperatureProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/doctor-login" element={<DoctorLogin />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/patient-details/:patientId" element={<PatientDetails />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Header />
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <Header />
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Header />
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/seizure-history" element={
                  <ProtectedRoute>
                    <Header />
                    <PatientSeizureHistory />
                  </ProtectedRoute>
                } />
                <Route path="/chb-test" element={
                  <ProtectedRoute>
                    <Header />
                    <SimpleCHBTest />
                  </ProtectedRoute>
                } />
                <Route path="/seizure-api" element={
                  <ProtectedRoute>
                    <Header />
                    <SeizureAPITester />
                  </ProtectedRoute>
                } />
                <Route path="/bulk-seizures" element={
                  <ProtectedRoute>
                    <Header />
                    <BulkSeizureCollector />
                  </ProtectedRoute>
                } />
                <Route path="/database-test" element={
                  <ProtectedRoute>
                    <Header />
                    <DatabaseTester />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </TemperatureProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
