import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, Mail, Lock } from "lucide-react";

// Mock doctor credentials for now
const MOCK_DOCTOR = {
  email: 'doc@example.com',
  password: 'password123',
  name: 'Dr. Sarah Johnson',
  specialty: 'Neurologist'
};

const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication
    if (email === MOCK_DOCTOR.email && password === MOCK_DOCTOR.password) {
      // Store doctor session in localStorage (temporary solution)
      localStorage.setItem('doctorSession', JSON.stringify({
        email: MOCK_DOCTOR.email,
        name: MOCK_DOCTOR.name,
        specialty: MOCK_DOCTOR.specialty,
        loginTime: new Date().toISOString()
      }));
      
      navigate('/doctor-dashboard');
    } else {
      setError('Invalid email or password. Try doc@example.com / password123');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
            <Stethoscope className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">Doctor Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your patient dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doc@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
            <p className="text-sm text-blue-600">Email: doc@example.com</p>
            <p className="text-sm text-blue-600">Password: password123</p>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-600"
            >
              Patient Login →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorLogin;
