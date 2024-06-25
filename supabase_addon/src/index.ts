import axios from 'axios';
import { initializeSupabase, insertState, insertEvent } from './supabaseClient';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file (for local development)
dotenv.config();

// Read configuration from the add-on options
const CONFIG_PATH = '/data/options.json'; // Path to the add-on options file
let config: any;

try {
  const configFile = fs.readFileSync(CONFIG_PATH, 'utf-8');
  config = JSON.parse(configFile);
} catch (error) {
  console.error('Error reading configuration file:', error);
  process.exit(1);
}

const SUPABASE_URL = config.supabase_url || process.env.SUPABASE_URL;
const SUPABASE_KEY = config.supabase_key || process.env.SUPABASE_KEY;
const HOME_ASSISTANT_URL = config.home_assistant_url || process.env.HOME_ASSISTANT_URL;
const HOME_ASSISTANT_TOKEN = config.home_assistant_token || process.env.HOME_ASSISTANT_TOKEN;

initializeSupabase(SUPABASE_URL, SUPABASE_KEY);

const fetchStates = async () => {
  const response = await axios.get(`${HOME_ASSISTANT_URL}/api/states`, {
    headers: {
      Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
    },
  });
  return response.data;
};

const fetchEvents = async () => {
  const response = await axios.get(`${HOME_ASSISTANT_URL}/api/events`, {
    headers: {
      Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
    },
  });
  return response.data;
};

const syncStates = async () => {
  const states = await fetchStates();
  for (const state of states) {
    await insertState({
      entity_id: state.entity_id,
      state: state.state,
      attributes: state.attributes,
      last_changed: state.last_changed,
      last_updated: state.last_updated,
    });
  }
};

const syncEvents = async () => {
  const events = await fetchEvents();
  for (const event of events) {
    await insertEvent({
      event_type: event.event_type,
      event_data: event.data,
      origin: event.origin,
      time_fired: event.time_fired,
    });
  }
};

const main = async () => {
  try {
    await syncStates();
    await syncEvents();
    console.log('Data synced successfully');
  } catch (error) {
    console.error('Error syncing data:', error);
  }
};

main();
