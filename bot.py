import os
import json
import logging
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    CallbackQueryHandler,
    filters,
)

# Load environment variables
load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DATA_PATH = os.getenv("DATA_PATH", "data/valorant_lineups.json")

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Constants
MAX_LINEUPS_PER_SEARCH = 3
TELEGRAM_CAPTION_LIMIT = 1024

def load_data() -> List[Dict[str, Any]]:
    """Loads valuation lineups from JSON file."""
    if not os.path.exists(DATA_PATH):
        logger.error(f"Data file not found at {DATA_PATH}")
        return []
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON data: {e}")
        return []

def parse_steps(description: str) -> List[str]:
    """Splits description into individual steps based on numbering and newlines."""
    # First, split by newlines and clean up
    raw_lines = [line.strip() for line in description.split('\n') if line.strip()]
    
    final_steps = []
    for line in raw_lines:
        # Split by numbering like "1. ", "2. " but keep the numbers
        # Regex to split by something like "1. ", "2. ", "3. ", case where it's at the start or inside a line
        sub_splits = re.split(r'(\d+\.\s+)', line)
        
        current_step = ""
        for part in sub_splits:
            if re.match(r'^\d+\.\s+$', part):
                if current_step.strip():
                    final_steps.append(current_step.strip())
                current_step = part
            else:
                current_step += part
        if current_step.strip():
            final_steps.append(current_step.strip())
        
    return [s for s in final_steps if s]

def detect_side(side_input: str) -> Optional[str]:
    """Detects if input refers to Attack or Defense based on keywords."""
    s = side_input.lower()
    attack_keywords = ["attack", "post plant", "execute", "atk"]
    defense_keywords = ["defense", "retake", "stall", "deny", "def"]
    
    for kw in attack_keywords:
        if kw in s:
            return "Attack"
    for kw in defense_keywords:
        if kw in s:
            return "Defense"
    return None

def filter_lineups(data: List[Dict[str, Any]], agent_name: str, map_name: str, side_input: str) -> List[Dict[str, Any]]:
    """Filters data for matching agent, map, and side."""
    results = []
    target_agent = agent_name.lower().strip()
    target_map = map_name.lower().strip()
    target_side = detect_side(side_input)
    
    for entry in data:
        if entry.get("agent", "").lower() == target_agent and entry.get("map", "").lower() == target_map:
            for lineup in entry.get("lineups", []):
                # Side detection logic check on title, description, or tags
                # Search keywords in title OR description OR tags
                content = (lineup.get("title", "") + " " + lineup.get("description", "") + " " + " ".join(lineup.get("tags", []))).lower()
                
                # Check if the detected side matches
                if target_side:
                    match_side = False
                    if target_side == "Attack":
                        if any(kw in content for kw in ["attack", "post plant", "execute"]):
                            match_side = True
                    else: # Defense
                        if any(kw in content for kw in ["defense", "retake", "stall", "deny"]):
                            match_side = True
                    
                    if match_side:
                        lineup_copy = lineup.copy()
                        lineup_copy["agent"] = entry.get("agent")
                        lineup_copy["map"] = entry.get("map")
                        lineup_copy["side"] = target_side
                        results.append(lineup_copy)
                else:
                    # If no side specified or detected, add it anyway but mark side as unknown
                    lineup_copy = lineup.copy()
                    lineup_copy["agent"] = entry.get("agent")
                    lineup_copy["map"] = entry.get("map")
                    lineup_copy["side"] = "Unknown"
                    results.append(lineup_copy)
                    
    return results[:MAX_LINEUPS_PER_SEARCH]

async def send_step(update: Update, context: ContextTypes.DEFAULT_TYPE, step_text: str, image_url: Optional[str], step_num: int):
    """Sends a single step with image if available."""
    chat_id = update.effective_chat.id
    caption = f"📌 Step {step_num}:\n{step_text}"
    
    # Truncate caption if it exceeds limit
    if len(caption) > TELEGRAM_CAPTION_LIMIT:
        caption = caption[:TELEGRAM_CAPTION_LIMIT-3] + "..."
        
    if image_url:
        try:
            await context.bot.send_photo(chat_id=chat_id, photo=image_url, caption=caption)
        except Exception as e:
            logger.error(f"Error sending photo: {e}")
            await context.bot.send_message(chat_id=chat_id, text=f"{caption}\n\n(Image failed to load)")
    else:
        await context.bot.send_message(chat_id=chat_id, text=caption)

async def send_lineup(update: Update, context: ContextTypes.DEFAULT_TYPE, lineup: Dict[str, Any]):
    """Sends the full lineup guide progressively."""
    chat_id = update.effective_chat.id
    
    # Header Message
    header = (
        f"🎯 {lineup['title']}\n\n"
        f"📍 Map: {lineup['map']}\n"
        f"🧑 Agent: {lineup['agent']}\n"
        f"⚔️ Side: {lineup['side']}\n\n"
        f"🏷 Tags: {', '.join(lineup.get('tags', []))}"
    )
    await context.bot.send_message(chat_id=chat_id, text=header)
    
    # Parse and send steps
    steps = parse_steps(lineup.get("description", ""))
    images = lineup.get("images", [])
    
    for i, step in enumerate(steps):
        img_url = images[i] if i < len(images) else None
        await send_step(update, context, step, img_url, i + 1)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles /start command."""
    await update.message.reply_text(
        "👋 Welcome to Valorant Lineup Bot!\n\n"
        "You can find lineups in two ways:\n"
        "1. Send a message like: `Sova Ascent attack`\n"
        "2. Click the button below to start guided selection.",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🔍 Start Selection", callback_data="select_agent")]
        ]),
        parse_mode="Markdown"
    )

async def handle_text_input(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles single-line text input like 'Sova Ascent attack'."""
    text = update.message.text.strip()
    parts = text.split()
    
    if len(parts) < 2:
        await update.message.reply_text(
            "⚠️ Invalid format. Please provide: `Agent Map Side` (Side is optional)\n"
            "Example: `Sova Ascent attack`"
        )
        return
    
    agent = parts[0]
    valence_map = parts[1]
    side = " ".join(parts[2:]) if len(parts) > 2 else ""
    
    data = load_data()
    lineups = filter_lineups(data, agent, valence_map, side)
    
    if not lineups:
        await update.message.reply_text(
            f"❌ No lineups found for {agent} on {valence_map} {side}.\n"
            "Try checking your spelling or search for another combo!"
        )
        return
    
    await update.message.reply_text(f"✅ Found {len(lineups)} lineups. Sending guides...")
    for lineup in lineups:
        await send_lineup(update, context, lineup)

async def callback_query_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles inline keyboard interactions."""
    query = update.callback_query
    await query.answer()
    data = query.data
    
    dataset = load_data()
    
    if data == "select_agent":
        # Get unique agents
        agents = sorted(list(set(entry["agent"] for entry in dataset)))
        keyboard = [
            [InlineKeyboardButton(agent, callback_data=f"agent_{agent}")]
            for agent in agents
        ]
        await query.edit_message_text("🧑 Choose an Agent:", reply_markup=InlineKeyboardMarkup(keyboard))
        
    elif data.startswith("agent_"):
        agent = data.replace("agent_", "")
        context.user_data["agent"] = agent
        # Get maps for this agent
        maps = sorted(list(set(entry["map"] for entry in dataset if entry["agent"] == agent)))
        keyboard = [
            [InlineKeyboardButton(m, callback_data=f"map_{m}")]
            for m in maps
        ]
        await query.edit_message_text(f"📍 Choose a Map for {agent}:", reply_markup=InlineKeyboardMarkup(keyboard))
        
    elif data.startswith("map_"):
        map_name = data.replace("map_", "")
        context.user_data["map"] = map_name
        # Choose side
        keyboard = [
            [InlineKeyboardButton("⚔️ Attack", callback_data="side_attack")],
            [InlineKeyboardButton("🛡️ Defense", callback_data="side_defense")]
        ]
        await query.edit_message_text(f"⚔️ Choose Side for {context.user_data['agent']} on {map_name}:", reply_markup=InlineKeyboardMarkup(keyboard))
        
    elif data.startswith("side_"):
        side = data.replace("side_", "")
        agent = context.user_data.get("agent")
        map_name = context.user_data.get("map")
        
        lineups = filter_lineups(dataset, agent, map_name, side)
        
        if not lineups:
            await query.edit_message_text(
                f"❌ No lineups found for {agent} on {map_name} {side}.\n"
                "Try another selection!",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("🔄 Restart", callback_data="select_agent")]])
            )
            return
            
        await query.delete_message()
        await context.bot.send_message(
            chat_id=query.message.chat_id, 
            text=f"✅ Found {len(lineups)} lineups for {agent} on {map_name} {side}. Sending guides..."
        )
        for lineup in lineups:
            await send_lineup(update, context, lineup)

def main():
    if not TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not found in .env file.")
        return

    application = ApplicationBuilder().token(TOKEN).build()
    
    # Handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(callback_query_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text_input))
    
    print("🚀 Bot is running...")
    application.run_polling()

if __name__ == "__main__":
    main()
