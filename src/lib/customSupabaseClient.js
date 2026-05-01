import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbgazlbyzkszicoxqrbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2F6bGJ5emtzemljb3hxcmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4ODQ1NTIsImV4cCI6MjA4MDQ2MDU1Mn0.wzWfOReoRNy1IyirYEwuimhMpCIrd_3GjLsRNr5QpnQ';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
