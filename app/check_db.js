import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqhjpswxbibylzfphcoo.supabase.co';
const supabaseKey = 'sb_publishable_9mKnxBelhiDEHfvhRE4npw_YIQLL1OA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: clubs } = await supabase.from('clubs').select('id, name, series_id');
  const { data: matches } = await supabase.from('matches').select('id, series_id, matchday');
  
  console.log('--- DATABASE CHECK ---');
  console.log('Total Clubs:', clubs?.length || 0);
  console.log('  Serie A Clubs:', clubs?.filter(c => c.series_id === '550e8400-e29b-41d4-a716-446655440000').length || 0);
  console.log('  Serie B Clubs:', clubs?.filter(c => c.series_id === '550e8400-e29b-41d4-a716-446655440001').length || 0);
  
  console.log('Total Matches:', matches?.length || 0);
  console.log('  Serie A Matches:', matches?.filter(m => m.series_id === '550e8400-e29b-41d4-a716-446655440000').length || 0);
  console.log('  Serie B Matches:', matches?.filter(m => m.series_id === '550e8400-e29b-41d4-a716-446655440001').length || 0);
}

check();
