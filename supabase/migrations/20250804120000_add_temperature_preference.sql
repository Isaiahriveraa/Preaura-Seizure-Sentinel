-- Add measurement system preferences to user profiles
-- This migration adds the ability to save measurement system preferences (Imperial/Metric)

-- Add measurement_system column to profiles table
ALTER TABLE profiles 
ADD COLUMN measurement_system TEXT DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial'));

-- Add temperature_unit column to profiles table (kept for backwards compatibility)
ALTER TABLE profiles 
ADD COLUMN temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit'));

-- Add comments for documentation
COMMENT ON COLUMN profiles.measurement_system IS 'User preferred measurement system: metric (cm, kg, celsius) or imperial (ft/in, lbs, fahrenheit)';
COMMENT ON COLUMN profiles.temperature_unit IS 'User preferred temperature unit: celsius or fahrenheit (deprecated - use measurement_system)';

-- Update existing profiles to have the default values
UPDATE profiles SET measurement_system = 'metric' WHERE measurement_system IS NULL;
UPDATE profiles SET temperature_unit = 'celsius' WHERE temperature_unit IS NULL;
