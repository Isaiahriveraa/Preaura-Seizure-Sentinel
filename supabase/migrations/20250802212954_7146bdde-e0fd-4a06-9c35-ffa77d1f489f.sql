-- Create biosensor_readings table
CREATE TABLE public.biosensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  heart_rate NUMERIC NOT NULL,
  skin_temp NUMERIC NOT NULL,
  eda NUMERIC NOT NULL,
  seizure_risk NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seizure_events table
CREATE TABLE public.seizure_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  risk_level NUMERIC NOT NULL,
  alert_triggered BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  emergency_contact TEXT,
  alert_threshold NUMERIC DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.biosensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seizure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for biosensor_readings
CREATE POLICY "Users can view their own readings" 
ON public.biosensor_readings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own readings" 
ON public.biosensor_readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for seizure_events
CREATE POLICY "Users can view their own seizure events" 
ON public.seizure_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own seizure events" 
ON public.seizure_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_biosensor_readings_user_timestamp ON public.biosensor_readings(user_id, timestamp DESC);
CREATE INDEX idx_seizure_events_user_timestamp ON public.seizure_events(user_id, timestamp DESC);