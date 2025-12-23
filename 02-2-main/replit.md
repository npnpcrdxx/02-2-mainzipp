# RDX-BoT

## Overview

RDX-BoT is a Facebook Messenger automation bot built with Node.js. It provides group management, Islamic content posting, an economy system, and various utility commands for Facebook Messenger groups. The bot uses a custom Facebook Chat API wrapper (`ws3-fca`) for messenger integration and SQLite for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Entry Points
- **`index.js`** - Express server running on port 5000 that provides a web dashboard for bot configuration and management
- **`rdx.js`** - Main bot runtime that handles Facebook login via appstate, command loading, event listening, and scheduled tasks (Islamic content posting)

### Facebook Integration
- Uses `ws3-fca` (customized as `rdx-fca` in `Data/rdx-fca/`) - A Facebook Chat API wrapper for Node.js
- Authentication via `appstate.json` (Facebook session cookies stored as JSON)
- Manages `fb_dtsg` tokens for API requests in `fb_dtsg_data.json`
- Supports automatic re-login and token refresh

### Command System
- Commands stored in `rdx/commands/` directory (60+ command files)
- Each command exports a `config` object with: name, aliases, description, usage, category, permissions (adminOnly, groupOnly)
- Each command exports a `run` function that receives: api, event, args, send, config, client, Users, Threads, Currencies
- Commands loaded dynamically via `Data/system/handle/handleRefresh.js`
- Supports prefixed commands (configurable prefix, default ".")
- Command categories: Admin, Group, Economy, Media, Fun, Utility, Friend, Profile

### Event System
- Events handled in `rdx/events/` directory
- Listen system in `Data/system/listen.js` routes events to appropriate handlers
- Handler files in `Data/system/handle/`:
  - `handleCommand.js` - Process commands
  - `handleEvent.js` - Handle events
  - `handleReaction.js` - Handle message reactions
  - `handleReply.js` - Handle reply-based interactions
  - `handleNotification.js` - Handle notifications
  - `handleCreateDatabase.js` - Auto-create database entries for new users/threads

### Database Layer
- **SQLite** via `better-sqlite3` for data persistence
- Controllers in `Data/system/controllers/`:
  - `users.js` - User management, banning, name caching
  - `threads.js` - Group management, approval system, per-thread settings
  - `currencies.js` - Economy system (balance, bank, daily rewards, streaks)

### Configuration
- `Data/config/envconfig.json` - Bot settings (name, prefix, admins, timezone, feature toggles)
- `Data/config/islamic_messages.json` - Islamic content for auto-posting

### Key Features
1. **Group Management** - Admin commands, anti-join/anti-out, member kicking, group locking
2. **Islamic Content** - Scheduled Quran ayats, namaz reminders, duas
3. **Economy System** - Daily rewards, balance, deposits, gambling
4. **AI Chat** - Integration with Cerebras AI for conversational responses
5. **Media Commands** - Avatar fetching, GIF search, image editing, cover creation

## External Dependencies

### Core Dependencies
- **express** - Web server for dashboard (port 5000)
- **better-sqlite3** - SQLite database for user/thread/currency data
- **ws3-fca** - Facebook Chat API wrapper (customized version in `Data/rdx-fca/`)
- **node-cron** - Scheduled tasks for Islamic content posting
- **moment-timezone** - Timezone handling (default: Asia/Karachi)

### Media & Utilities
- **axios** - HTTP requests for external APIs
- **jimp** - Image processing for profile pictures and edits
- **canvas** - Image generation for covers and edits
- **fs-extra** - Enhanced file system operations
- **yt-search** - YouTube search functionality

### External APIs
- **Cerebras AI** - Conversational AI responses (requires API key)
- **Tenor API** - GIF search functionality
- **ImgBB API** - Image hosting
- **Facebook Graph API** - Profile pictures and user data

### Authentication
- Facebook session cookies stored in `appstate.json`
- Bot admin UIDs configured in `envconfig.json`
- Group approval system for controlled access