# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Entity Filtering**: Added the ability for users to specify an array of entities they want to store in Supabase. If no array is provided, all entities will be stored.
- **Configuration Options**: Added configuration options for specifying entities in the `options.json` file and `.env` file.
- **WebSocket Connection**: Implemented WebSocket connection to Home Assistant for real-time event streaming and storage in Supabase.

### Changed

- **Data Insertion Logic**: Enhanced data insertion logic to include both original and transformed event data, ensuring structured storage in Supabase.
- **Script Flexibility**: Updated the script to conditionally use configuration from the `.env` file or `options.json` file based on availability.

### Fixed

- **Schema Updates**: Fixed issues with missing columns in the Supabase schema to ensure all event data is properly stored.
- **Event Filtering**: Corrected the event filtering mechanism to handle cases where no specific entities are provided, defaulting to storing all events.

### Removed

- **Hardcoded Values**: Removed hardcoded environment variables, replacing them with configurable options for better flexibility and user control.

## [0.1.4] - 2024-06-25

### Added

- Initial release of the Home Assistant Supabase client add-on.
- Support for storing all Home Assistant states and events in Supabase.
- Basic configuration options via `options.json`.

## [1.1.0] - 2024-06-25

### Added

- Added icon to the addon.