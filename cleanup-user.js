const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cctmavwcdsqwkaeonqfk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdG1hdndjZHNxd2thZW9ucWZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI3OTczNCwiZXhwIjoyMDc3ODU1NzM0fQ.cBHLITkbWv1FAJORSm-Q6pqn0QDV1GMhYekjWH_0GPw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function cleanup() {
  console.log('Cleaning up test user: neeraj.gmf@gmail.com\n');

  // Delete from session table first (foreign key constraint)
  const { error: sessionError } = await supabase
    .from('session')
    .delete()
    .eq('userId', (
      await supabase
        .from('user')
        .select('id')
        .eq('email', 'neeraj.gmf@gmail.com')
        .single()
    ).data?.id);

  if (sessionError && sessionError.code !== 'PGRST116') {
    console.error('Error deleting sessions:', sessionError);
  } else {
    console.log('✅ Sessions deleted');
  }

  // Delete from credits table
  const { error: creditsError } = await supabase
    .from('credits')
    .delete()
    .eq('userId', (
      await supabase
        .from('user')
        .select('id')
        .eq('email', 'neeraj.gmf@gmail.com')
        .single()
    ).data?.id);

  if (creditsError && creditsError.code !== 'PGRST116') {
    console.error('Error deleting credits:', creditsError);
  } else {
    console.log('✅ Credits deleted');
  }

  // Delete user
  const { error: userError } = await supabase
    .from('user')
    .delete()
    .eq('email', 'neeraj.gmf@gmail.com');

  if (userError) {
    console.error('Error deleting user:', userError);
  } else {
    console.log('✅ Test user deleted successfully');
  }

  // Delete any pending OTP verifications
  const { error: otpError } = await supabase
    .from('verification')
    .delete()
    .eq('identifier', 'neeraj.gmf@gmail.com');

  if (otpError && otpError.code !== 'PGRST116') {
    console.error('Error deleting OTP:', otpError);
  } else {
    console.log('✅ Pending OTPs deleted');
  }

  console.log('\n✅ Cleanup complete! You can now test signup again.');
}

cleanup();
