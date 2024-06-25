import express from 'express';
import path from 'path';
import WebSocket from 'ws';
import { initializeSupabase, insertEvent, insertTransformedEvent, insertState } from './supabaseClient';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import cors from 'cors';
import axios from 'axios';

// Load environment variables from .env file if it exists
dotenv.config();

const CONFIG_PATH = '/data/options.json'; // Path to the add-on options file

// Function to get configuration
const getConfig = () => {
  // Check if environment variables are set
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY && process.env.HOME_ASSISTANT_URL && process.env.HOME_ASSISTANT_TOKEN) {
    return {
      supabase_url: process.env.SUPABASE_URL,
      supabase_key: process.env.SUPABASE_KEY,
      home_assistant_url: process.env.HOME_ASSISTANT_URL,
      home_assistant_token: process.env.HOME_ASSISTANT_TOKEN,
      entities: process.env.ENTITIES ? process.env.ENTITIES.split(',') : []
    };
  }

  // Fallback to reading from the options.json file
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configFile = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(configFile);
    } else {
      console.warn(`Configuration file not found at ${CONFIG_PATH}. Falling back to environment variables.`);
      return {
        supabase_url: process.env.SUPABASE_URL,
        supabase_key: process.env.SUPABASE_KEY,
        home_assistant_url: process.env.HOME_ASSISTANT_URL,
        home_assistant_token: process.env.HOME_ASSISTANT_TOKEN,
        entities: process.env.ENTITIES ? process.env.ENTITIES.split(',') : []
      };
    }
  } catch (error) {
    console.error('Error reading configuration file:', error);
    process.exit(1);
  }
};

const config = getConfig();

const SUPABASE_URL = config.supabase_url;
const SUPABASE_KEY = config.supabase_key;
const HOME_ASSISTANT_URL = config.home_assistant_url;
const HOME_ASSISTANT_TOKEN = config.home_assistant_token;
const ENTITIES = config.entities;
const HOME_ASSISTANT_WS_URL = `${HOME_ASSISTANT_URL.replace(/^http/, 'ws')}/api/websocket`;
initializeSupabase(SUPABASE_URL, SUPABASE_KEY);

const connectAndSubscribeToEvents = () => {
  const ws = new WebSocket(HOME_ASSISTANT_WS_URL);

  ws.on('open', () => {
    console.log('WebSocket connection opened');
    ws.send(JSON.stringify({
      type: 'auth',
      access_token: HOME_ASSISTANT_TOKEN
    }));
  });

  ws.on('message', async (data) => {
    const message = JSON.parse(data.toString());

    if (message.type === 'auth_ok') {
      console.log('Authenticated successfully');
      ws.send(JSON.stringify({
        id: 1,
        type: 'subscribe_events',
        event_type: 'state_changed' // Change to the event type you are interested in
      }));
    } else if (message.type === 'event') {
      const event = message.event;
      console.log('Received event:');

      // Check if the event's entity_id is in the list of entities to store, or if the list is empty (store all)
      if (ENTITIES.length === 0 || ENTITIES.includes(event.data.entity_id)) {
        // Transform the event data
        const transformedEvent = {
          entity_id: event.data.entity_id,
          new_state: event.data.new_state,
          old_state: event.data.old_state,
          context_id: event.data.new_state.context.id,
          user_id: event.data.new_state.context.user_id,
          parent_id: event.data.new_state.context.parent_id,
          last_changed: event.data.new_state.last_changed,
          last_updated: event.data.new_state.last_updated,
          last_reported: event.data.new_state.last_reported,
        };

        try {
          // Insert the original event data
          console.log('Inserting original event data to Supabase');
          await insertEvent({
            event_type: event.event_type,
            event_data: event.data,
            context: event.data.new_state.context,
            origin: event.origin,
            time_fired: event.time_fired,
          });

          // Insert the transformed event data
          console.log('Inserting transformed event data to Supabase');
          await insertTransformedEvent(transformedEvent);
        } catch (error) {
          console.error('Error inserting event:', error);
        }
      } else {
        console.log('Entity not in the list of entities to store:');
      }
    } else if (message.type === 'auth_invalid') {
      console.error('Authentication failed:', message.message);
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

// Function to fetch states from Home Assistant and insert them into Supabase
const fetchAndStoreStates = async () => {
  try {
    const response = await axios.get(`${HOME_ASSISTANT_URL}/api/states`, {
      headers: {
        Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`
      }
    });

    const states = response.data;
    console.log('Fetched states');

    for (const state of states) {
      try {
        console.log('Inserting state');
        await insertState({
          entity_id: state.entity_id,
          state: state.state,
          attributes: state.attributes,
          last_changed: state.last_changed,
          last_updated: state.last_updated,
          context: state.context,
        });
      } catch (error) {
        console.error('Error inserting state:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching states:', error);
  }
};

// Start WebSocket connection and subscribe to events
connectAndSubscribeToEvents();

// Fetch and store states at startup
fetchAndStoreStates();

// Express server setup
const app = express();
const port = 8099;

// Use CORS middleware to allow requests from any origin
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log('Serving frontend');
});

// Endpoint to get Supabase config
app.get('/config', (req, res) => {
  res.json({ SUPABASE_URL, SUPABASE_KEY });
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
  console.log('Health check passed');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Supabase Client UI listening at http://localhost:${port}`);
});
