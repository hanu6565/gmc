import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hltstcgyupanaaoadvsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdHN0Y2d5dXBhbmFhb2FkdnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODI5MDYsImV4cCI6MjEwMjM1ODkwNn0.WVJkbj0p0DPVzmNoNyPShbU7B6AKio-kTi-OLeikkE4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
