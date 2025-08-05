-- Add seizure data tables to store collected CHB-MIT data
-- This prevents duplicates and enables offline access

-- Table for storing CHB-MIT seizure events
CREATE TABLE chb_seizure_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    seizure_number INTEGER NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    start_sample INTEGER NOT NULL,
    end_sample INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate seizure events
    UNIQUE(case_id, file_name, seizure_number)
);

-- Table for tracking collection status
CREATE TABLE chb_collection_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id TEXT UNIQUE NOT NULL,
    total_seizures INTEGER NOT NULL DEFAULT 0,
    total_files INTEGER NOT NULL DEFAULT 0,
    collection_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, collected, error
    error_message TEXT,
    api_source TEXT DEFAULT 'local', -- api, local, manual
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_chb_seizure_events_case_id ON chb_seizure_events(case_id);
CREATE INDEX idx_chb_seizure_events_file_name ON chb_seizure_events(file_name);
CREATE INDEX idx_chb_seizure_events_time_range ON chb_seizure_events(start_time, end_time);

-- RLS policies for security
ALTER TABLE chb_seizure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chb_collection_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read CHB data
CREATE POLICY "Users can read CHB seizure events" ON chb_seizure_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert CHB seizure events" ON chb_seizure_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update CHB seizure events" ON chb_seizure_events
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read CHB collection status" ON chb_collection_status
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert CHB collection status" ON chb_collection_status
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update CHB collection status" ON chb_collection_status
    FOR UPDATE USING (auth.role() = 'authenticated');
