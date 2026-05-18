import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lblycbpbwokclsircdhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibHljYnBid29rY2xzaXJjZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzYwMTIsImV4cCI6MjA5MDkxMjAxMn0.CNcvJ7v2YtOS6Kdbavs2Bc8qAUb1__6EL_6NkF2o-4Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
