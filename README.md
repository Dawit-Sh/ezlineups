# Valorant Lineup Telegram Bot

A Telegram bot that provides step-by-step Valorant lineup guides with images, using a local JSON dataset.

## Features
- **Progressive Guides**: Sends each lineup step as a separate message with its corresponding image.
- **Visual Learning**: Prioritizes images for each step.
- **Two Search Modes**:
    - **Single-line**: Send `Sova Ascent attack` for quick results.
    - **Guided Selection**: Use interactive buttons to choose Agent, Map, and Side.
- **Smart Filtering**: Detects side (Attack/Defense) based on keywords.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   - Create a `.env` file based on `.env.example`.
   - Add your [Telegram Bot Token](https://t.me/BotFather).
   - Ensure `DATA_PATH` points to `data/valorant_lineups.json`.

3. **Run the Bot**:
   ```bash
   python bot.py
   ```

## Project Structure
- `bot.py`: Main bot logic and handlers.
- `data/valorant_lineups.json`: Lineup dataset.
- `requirements.txt`: Python dependencies.
- `.env.example`: Environment variable template.

## Requirements
- Python 3.8+
- `python-telegram-bot`
- `python-dotenv`
