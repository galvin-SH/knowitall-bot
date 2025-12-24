# knowitall-bot

![MIT License](https://img.shields.io/badge/License-MIT%20License-blue)

## Description

A Discord bot that allows users to interact with a locally hosted LLM and receive both text and audio responses to their prompts. The bot uses RVC (Retrieval-based Voice Conversion) to generate character voices for text-to-speech output.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)
- [Contributing](#contributing)
- [Questions](#questions)

## Features

- **Local LLM Integration** - Connects to Ollama for AI-powered responses
- **Voice Synthesis** - Text-to-speech with custom RVC voice models
- **GPU Acceleration** - CUDA support for fast voice generation
- **Multiple Voices** - Supports multiple character voices
- **Discord Voice Playback** - Plays generated audio directly in voice channels

## Prerequisites

Before installing, ensure you have the following:

- **Node.js** >= 22.12.0 (recommend using [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows))
- **Python** 3.12.x (recommend using [pyenv](https://github.com/pyenv/pyenv) or [pyenv-win](https://github.com/pyenv-win/pyenv-win))
- **pipenv** - Python dependency management (`pip install pipenv`)
- **Ollama** - Local LLM server ([download](https://ollama.com/download))
- **NVIDIA GPU** with CUDA support (recommended for TTS performance)
- **Discord Bot Token** - [Create a Discord app](https://discord.com/developers/docs/quick-start/getting-started)

## Installation

### 1. Clone the Repository

```bash
git clone git@github.com:galvin-SH/knowitall-bot.git
cd knowitall-bot
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set Up the TTS+RVC Server

```bash
cd tts_rvc_server

# Install Python dependencies
pipenv install

# Install PyTorch with CUDA support (for GPU acceleration)
pipenv run pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

### 4. Add RVC Voice Models

Place your RVC model files in `tts_rvc_server/models/`:

```
tts_rvc_server/models/
├── model-1.pth
├── model-1.index
├── model-2.pth
├── model-2.index
├── model-3.pth
└── model-3.index
```

Each voice requires a `.pth` model file and a corresponding `.index` file.

### 5. Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_server_id
DISCORD_CHANNEL_ID=your_voice_channel_id

# Ollama Configuration
OLLAMA_MODEL=llama3.2
OLLAMA_HOST=localhost
OLLAMA_PORT=11434

# Voice Configuration
VOICE_MODEL=model-1

# TTS+RVC Server Configuration
TTS_SERVER_URL=http://127.0.0.1:5050
TTS_HOST=127.0.0.1
TTS_PORT=5050
RVC_DEVICE=cuda:0
```

#### Environment Variable Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_TOKEN` | (required) | Your Discord bot token |
| `DISCORD_GUILD_ID` | (required) | Discord server ID where the bot operates |
| `DISCORD_CHANNEL_ID` | (required) | Voice channel ID for audio playback |
| `OLLAMA_MODEL` | (required) | Ollama model name (e.g., "llama3.2", "mistral") |
| `OLLAMA_HOST` | `localhost` | Ollama server hostname |
| `OLLAMA_PORT` | `11434` | Ollama server port |
| `VOICE_MODEL` | (required) | Voice to use (must match a voice in `voice_config.json`) |
| `TTS_SERVER_URL` | `http://127.0.0.1:5050` | TTS server URL for the Discord bot |
| `TTS_HOST` | `127.0.0.1` | TTS server bind address |
| `TTS_PORT` | `5050` | TTS server port |
| `RVC_DEVICE` | `cuda:0` | PyTorch device (`cuda:0`, `cuda:1`, or `cpu`) |

### 6. Configure Voice Models

Copy the example voice configuration and customize it:

```bash
cp tts_rvc_server/voice_config.example.json tts_rvc_server/voice_config.json
```

Edit `voice_config.json` to define your voices:

```json
{
  "voices": {
    "model-1": {
      "pth_file": "model-1.pth",
      "index_file": "model-1.index",
      "edge_voice": "en-US-AvaMultilingualNeural",
      "tts_rate": 0,
      "pitch": 0,
      "filter_radius": 3,
      "index_rate": 0.75,
      "protect": 0.5,
      "clean_audio": true,
      "clean_strength": 0.5
    }
  }
}
```

#### Voice Configuration Parameters

| Parameter | Description |
|-----------|-------------|
| `pth_file` | RVC model file name (in `models/` directory) |
| `index_file` | RVC index file name (in `models/` directory) |
| `edge_voice` | Microsoft Edge TTS voice for base audio |
| `tts_rate` | Speech rate adjustment (-100 to 100) |
| `pitch` | Pitch shift in semitones |
| `filter_radius` | Median filtering radius (0-7, reduces breathiness) |
| `index_rate` | How much to use the index file (0.0-1.0) |
| `protect` | Protect voiceless consonants (0.0-0.5) |
| `clean_audio` | Whether to apply noise reduction |
| `clean_strength` | Noise reduction strength (0.0-1.0) |

## Usage

### Start Ollama

```bash
ollama serve
```

### Start the TTS+RVC Server

```bash
cd tts_rvc_server
pipenv run uvicorn server:app --host 127.0.0.1 --port 5050
```

### Start the Discord Bot

```bash
npm run start
```

### Interacting with the Bot

1. Join the voice channel specified in `DISCORD_CHANNEL_ID`
2. Mention the bot in a text channel: `@knowitall-bot hello!`
3. The bot will:
   - Join the voice channel
   - Generate a response using Ollama
   - Reply in the text channel
   - Play the TTS audio in the voice channel

## Project Structure

```
knowitall-bot/
├── src/
│   ├── index.js          # Main entry point and event handlers
│   ├── client.js         # Discord client configuration
│   ├── context.js        # Conversation history management
│   ├── ollama.js         # Ollama LLM integration
│   ├── tts.js            # TTS server client
│   └── voiceConnection.js # Discord voice channel management
├── tts_rvc_server/
│   ├── server.py              # FastAPI TTS+RVC server
│   ├── voice_config.example.json  # Voice config template
│   ├── voice_config.json      # Your voice config (gitignored)
│   ├── Pipfile                # Python dependencies
│   ├── models/                # RVC voice models (.pth, .index)
│   └── output/                # Generated audio files
├── .env.example          # Environment variable template
├── .env                  # Your environment config (gitignored)
├── package.json          # Node.js dependencies
└── README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the Discord bot |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |

## Troubleshooting

### TTS Server Won't Start
- Ensure Python 3.12.x is active: `python --version`
- Verify pipenv environment: `pipenv --venv`
- Check CUDA availability: `python -c "import torch; print(torch.cuda.is_available())"`

### Bot Can't Connect to Voice
- Ensure `@discordjs/voice` and `@snazzah/davey` are installed
- Verify `DISCORD_CHANNEL_ID` is correct
- Check bot has permission to join voice channels

### No Audio Playback
- Confirm TTS server is running on port 5050
- Check model files exist in `tts_rvc_server/models/`
- Verify `VOICE_MODEL` matches a voice defined in `voice_config.json`
- Ensure `voice_config.json` exists (copy from `voice_config.example.json`)

### TTS Server Config Not Found
- Copy the example config: `cp tts_rvc_server/voice_config.example.json tts_rvc_server/voice_config.json`
- Edit `voice_config.json` to match your model file names

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit).

## Contributing

This project is not currently seeking collaborators.

## Questions

If you have any questions or concerns regarding this project, please open an issue or contact me via GitHub.

- GitHub: [galvin-sh](https://github.com/galvin-sh)
