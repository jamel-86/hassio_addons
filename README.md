# Home Assistant Supabase Client Add-on

[![Release](https://img.shields.io/github/v/release/jamel-86/hassio_addons)](https://github.com/jamel-86/hassio_addons/releases)
[![License](https://img.shields.io/github/license/jamel-86/hassio_addons)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/jamel-86/hassio_addons)](https://github.com/jamel-86/hassio_addons/graphs/contributors)

## Overview

The Home Assistant Supabase Client add-on allows you to store all states and events from your Home Assistant instance directly into Supabase, providing a robust and scalable solution for data storage and analysis.

## Features

- **Real-time Event Streaming**: Stream all your Home Assistant events to Supabase in real time.
- **Entity Filtering**: Specify which entities to store in Supabase, or store all entities if no specific entities are provided.
- **Flexible Configuration**: Configure the add-on using the `options.json` file or environment variables.
- **Data Transformation**: Store both original and transformed event data for structured storage and easy querying.

## Installation

1. **Add the Repository**

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fjamel-86%2Fhassio_addons)

2. **Install the Add-on**

Find the Home Assistant Supabase Client add-on in the add-on store and click **Install**.

3. **Configure the Add-on**

After installation, navigate to the add-on's **Configuration** tab and set the necessary options:

```json
{
  "supabase_url": "your-supabase-url",
  "supabase_key": "your-supabase-key",
  "home_assistant_url": "your-home-assistant-url",
  "home_assistant_token": "your-long-lived-access-token",
  "entities": ["sensor.temperature", "sensor.humidity"]
}
```
