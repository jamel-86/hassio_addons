import axios from 'axios';
import { initializeSupabase, insertState, insertEvent } from './supabaseClient';
import * as fs from 'fs';

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

const SUPABASE_URL = config.supabase_url;
const SUPABASE_KEY = config.supabase_key;
const HOME_ASSISTANT_URL = config.home_assistant_url;
const HOME_ASSISTANT_TOKEN = config.home_assistant_token;

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
    try {
      await insertState({
        entity_id: state.entity_id,
        state: state.state,
        attributes: state.attributes,
        last_changed: state.last_changed,
        last_updated: state.last_updated,
      });
    } catch (error) {
      console.error('Error inserting state:', error);
    }
  }
};

const syncEvents = async () => {
  const events = await fetchEvents();
  for (const event of events) {
    try {
      await insertEvent({
        event_type: event.event_type,
        event_data: event.data,
        origin: event.origin,
        time_fired: event.time_fired,
      });
    } catch (error) {
      console.error('Error inserting event:', error);
    }
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
