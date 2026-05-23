// ==========================
// SUPABASE
// ==========================

const SUPABASE_URL = 'https://xkxoerpxhueshzzckcrb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreG9lcnB4aHVlc2h6emNrY3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjM2NTQsImV4cCI6MjA5NTA5OTY1NH0.uYCEJOkTrASG62TSJy4AcOkTFX2epk3I5HRd1USm4Dc';

const client = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);
