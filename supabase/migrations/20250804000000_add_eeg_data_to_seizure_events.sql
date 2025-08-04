-- Add EEG data column to seizure_events table
-- This migration adds support for storing EEG waveform data with seizure events

-- Add eeg_data column to store JSON EEG data
ALTER TABLE seizure_events 
ADD COLUMN eeg_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN seizure_events.eeg_data IS 'JSON storage for EEG waveform data including channels, sampling rate, and metadata';

-- Create index for better query performance on EEG data
CREATE INDEX idx_seizure_events_eeg_data 
ON seizure_events USING GIN (eeg_data);

-- Update Row Level Security to include eeg_data
-- (Inherits existing RLS policies for seizure_events table)
