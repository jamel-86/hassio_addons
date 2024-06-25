import { createClient } from '@supabase/supabase-js';

let supabase: any;

export const initializeSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
};

export const insertState = async (data: any) => {
  const { error } = await supabase.from('states').insert(data);
  if (error) throw new Error(error.message);
};

export const insertEvent = async (data: any) => {
  if (!data.event_type || !data.event_data) {
    console.error('Invalid event data:', data);
    throw new Error('Invalid event data: event_type and event_data are required');
  }

  const { error } = await supabase.from('events').insert(data);
  if (error) throw new Error(error.message);
};
