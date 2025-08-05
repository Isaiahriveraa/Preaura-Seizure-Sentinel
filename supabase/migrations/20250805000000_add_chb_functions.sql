-- Add utility functions for CHB data management
-- These functions help bypass RLS and provide better data access

-- Function to get count of CHB seizures (for testing connection)
CREATE OR REPLACE FUNCTION get_chb_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM chb_seizure_events);
END;
$$;

-- Function to safely insert CHB seizure data (bypasses RLS)
CREATE OR REPLACE FUNCTION insert_chb_seizure(
  p_case_id TEXT,
  p_file_name TEXT, 
  p_seizure_number INTEGER,
  p_start_time INTEGER,
  p_end_time INTEGER,
  p_duration INTEGER,
  p_start_sample INTEGER,
  p_end_sample INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO chb_seizure_events (
    case_id, file_name, seizure_number, start_time, end_time, 
    duration, start_sample, end_sample
  ) VALUES (
    p_case_id, p_file_name, p_seizure_number, p_start_time, p_end_time,
    p_duration, p_start_sample, p_end_sample
  )
  ON CONFLICT (case_id, file_name, seizure_number) 
  DO UPDATE SET 
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    duration = EXCLUDED.duration,
    start_sample = EXCLUDED.start_sample,
    end_sample = EXCLUDED.end_sample,
    updated_at = timezone('utc'::text, now())
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Function to get CHB statistics (bypasses RLS)
CREATE OR REPLACE FUNCTION get_chb_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'totalSeizures', COUNT(*),
    'uniquePatients', COUNT(DISTINCT case_id),
    'avgDuration', ROUND(AVG(duration)),
    'completedCases', (SELECT COUNT(DISTINCT case_id) FROM chb_collection_status WHERE status = 'collected'),
    'databaseConnected', true
  ) INTO stats
  FROM chb_seizure_events;
  
  RETURN stats;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_chb_count() TO authenticated;
GRANT EXECUTE ON FUNCTION insert_chb_seizure(TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chb_stats() TO authenticated;

-- Also grant to anon for easier testing (can remove later)
GRANT EXECUTE ON FUNCTION get_chb_count() TO anon;
GRANT EXECUTE ON FUNCTION insert_chb_seizure(TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_chb_stats() TO anon;
