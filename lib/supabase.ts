
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrctsdcszannvjsevzfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyY3RzZGNzemFubnZqc2V2emZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3Mzc4MjIsImV4cCI6MjA4MjMxMzgyMn0.gMFF8Yt6QqaM-p1zhG_x2eX8gucZJSb2C7KNcL2dUmI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
