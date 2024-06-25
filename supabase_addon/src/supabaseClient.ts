import { createClient } from '@supabase/supabase-js';

// Define a function to initialize the Supabase client
let supabase: any;

export const initializeSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
};

export const insertState = async (data: any) => {
  const { error } = await supabase.from('states').insert(data);
  if (error) throw new Error(error.message);
};

export const insertEvent = async (data: any) => {
  const { error } = await supabase.from('events').insert(data);
  if (error) throw new Error(error.message);
};
