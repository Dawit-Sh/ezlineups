import requests
import json
import time
import argparse
import logging
from tqdm import tqdm

# Constants
BASE_URL = "https://lineupsvalorant.com"
GET_RESULTS_URL = f"{BASE_URL}/get_results"
GET_LINEUP_URL = f"{BASE_URL}/get_lineup"
GET_SETUP_URL = f"{BASE_URL}/get_setup"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)# User-Agent to mimic a real browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Content-Type": "application/json",
    "Referer": BASE_URL
}


# Agents and Maps from agent_map_const.js
AGENTS = [
    'Astra', 'Breach', 'Brimstone', 'Chamber', 'Clove', 'Cypher', 'Deadlock', 
    'Fade', 'Gekko', 'Harbor', 'KAYO', 'Killjoy', 'Neon', 'Omen', 'Phoenix', 
    'Raze', 'Sage', 'Skye', 'Sova', 'Tejo', 'Veto', 'Viper', 'Vyse', 'Waylay', 'Yoru'
]

MAPS = [
    'Abyss', 'Ascent', 'Bind', 'Breeze', 'Corrode', 'Fracture', 
    'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset'
]

# Ability mapping (simplified from agent_map_const.js)
AGENT_ABILITIES = {
    'Astra': ['Gravity Well', 'Nova Pulse', 'Nebula_Dissipate', 'Cosmic Divide'],
    'Breach': ['Aftershock', 'Flashpoint', 'Fault Line', 'Rolling Thunder'],
    'Brimstone': ['Incendiary', 'Sky Smoke', 'Orbital Strike'],
    'Chamber': ['Trademark', 'Rendezvous'],
    'Clove': ['Meddle'],
    'Cypher': ['Trapwire', 'Cyber Cage', 'Spycam'],
    'Deadlock': ['GravNet', 'Sonic Sensor', 'Barrier Mesh', 'Annihilation'],
    'Fade': ['Prowler', 'Seize', 'Haunt', 'Nightfall'],
    'Gekko': ['Mosh Pit', 'Wingman', 'Dizzy', 'Thrash'],
    'Harbor': ['Storm Surge'],
    'KAYO': ['Frag_Ment', 'Flash_Drive', 'Zero_Point'],
    'Killjoy': ['Nanoswarm', 'Alarmbot', 'Turret', 'Lockdown'],
    'Neon': ['Fast Lane', 'Relay Bolt'],
    'Omen': ['Shrouded Step', 'Paranoia', 'Dark Cover'],
    'Phoenix': ['Hot Hands'],
    'Raze': ['Boom Bot', 'Paint Shells'],
    'Sage': ['Barrier Orb', 'Slow Orb'],
    'Skye': ['Guiding Light'],
    'Sova': ['Owl Drone', 'Shock Bolt', 'Recon Bolt', 'Hunters Fury'],
    'Tejo': ['Stealth Drone', 'Special Delivery', 'Guided Salvo', 'Armageddon'],
    'Veto': ['Chokehold', 'Interceptor'],
    'Viper': ['Snake Bite', 'Poison Cloud', 'Toxic Screen', 'Vipers Pit'],
    'Vyse': ['Razorvine', 'Shear', 'Arc Rose'],
    'Waylay': ['Saturate', 'Lightspeed', 'Refract', 'Convergent Paths'],
    'Yoru': ['Fakeout', 'Blindside', 'Gatecrash']
}

# Ability to Agent mapping for attribution
ABILITY_TO_AGENT = {}
for agent, abilities in AGENT_ABILITIES.items():
    for ability in abilities:
        ABILITY_TO_AGENT[ability.replace(' ', '_').replace('/', '_')] = agent

def find_agent(ability_tag):
    """Finds the agent associated with an ability tag."""
    return ABILITY_TO_AGENT.get(ability_tag.replace(' ', '_').replace('/', '_'), "Unknown")

def make_request(url, payload, retries=3):
    """Makes a POST request with retries."""
    for attempt in range(retries):
        try:
            logger.debug(f"Request: {url} | Payload: {payload}")
            response = requests.post(url, json=payload, headers=HEADERS, timeout=10)
            response.raise_for_status()
            data = response.json()
            logger.debug(f"Response: {data}")
            return data
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
            time.sleep(2 ** attempt)  # Exponential backoff
    return None

def scrape_lineups_for_combination(agent, map_name):
    """Scrapes all lineups for a specific agent and map."""
    all_lineups = {} # Use dict to de-duplicate by ID
    
    agent_abilities_set = set(a.replace(' ', '_').replace('/', '_') for a in AGENT_ABILITIES.get(agent, []))
    if not agent_abilities_set:
        return []

    start_results = 0
    num_per_page = 1000
    
    while True:
        payload = {
            "map": map_name,
            "abilities": list(agent_abilities_set),
            "start": None,
            "end": None,
            "type": "all",
            "side": 0,
            "num_results": num_per_page,
            "start_results": start_results,
            "user_token": None
        }

        results_data = make_request(GET_RESULTS_URL, payload)
        if not results_data:
            break
            
        # Combine results and setups from response
        items = results_data.get('results', []) + results_data.get('setups', [])
        if not items:
            break

        logger.info(f"Fetched {len(items)} items for {agent} @ {map_name} (start={start_results}). Processing...")
        
        for result in tqdm(items, desc=f"{agent} @ {map_name}", leave=False):
            lineup_id = result['id']
            is_setup = result.get('type') == 'setup'
            item_key = f"{'setup' if is_setup else 'lineup'}_{lineup_id}"
            
            if item_key in all_lineups:
                continue

            detail_url = GET_SETUP_URL if is_setup else GET_LINEUP_URL
            detail_payload = {"id": lineup_id, "user_token": None} if not is_setup else {"setup_id": lineup_id, "user_token": None}
            
            details = make_request(detail_url, detail_payload)
            if not details:
                continue

            lineup_tags = details.get('abilities', result.get('abilities', '')).split(':')
            lineup_tags = [tag.strip() for tag in lineup_tags if tag.strip()]
            
            # Inclusive check: if ANY tag matches the agent's abilities
            lineup_abilities_normalized = set(t.replace(' ', '_').replace('/', '_') for t in lineup_tags)
            if not (lineup_abilities_normalized & agent_abilities_set):
                continue

            # Handle images
            if is_setup:
                image_urls = [f"{BASE_URL}/static/setup_images/{lineup_id}/cover.webp"]
                if 'abilities' in details:
                    for idx, ab in enumerate(details['abilities']):
                        for img_idx in range(ab.get('num_images', 0)):
                            image_urls.append(f"{BASE_URL}/static/setup_images/{lineup_id}/images/{idx+1}/{img_idx+1}.webp")
            else:
                num_images = details.get('images', result.get('num_images', 1))
                image_urls = [f"{BASE_URL}/static/lineup_images/{lineup_id}/{i+1}.webp" for i in range(num_images)]

            all_lineups[item_key] = {
                "title": details.get('title', result.get('title', 'Unknown')),
                "description": details.get('description', '').replace('&lt;br&gt;', '\n').replace('<br>', '\n').replace('&#34;', '"').replace('&#39;', "'"),
                "images": image_urls,
                "video": details.get('video_url', None),
                "tags": lineup_tags
            }
            time.sleep(0.05) # Reduced throttle but still respectful

        if len(items) < num_per_page:
            break
        start_results += num_per_page

    return list(all_lineups.values())

def main():
    parser = argparse.ArgumentParser(description="Valorant Lineups Scraper")
    parser.add_argument("--agent", help="Filter by agent name (e.g., Sova)")
    parser.add_argument("--map", help="Filter by map name (e.g., Ascent)")
    args = parser.parse_args()

    agents_to_scrape = [args.agent] if args.agent else AGENTS
    maps_to_scrape = [args.map] if args.map else MAPS

    output_data = []

    # Outer progress bar for agents/maps
    total_combinations = len(agents_to_scrape) * len(maps_to_scrape)
    with tqdm(total=total_combinations, desc="Overall Progress") as pbar:
        for agent in agents_to_scrape:
            for map_name in maps_to_scrape:
                lineups = scrape_lineups_for_combination(agent, map_name)
                if lineups:
                    output_data.append({
                        "agent": agent,
                        "map": map_name,
                        "lineups": [
                            {
                                "title": l["title"],
                                "description": l["description"],
                                "images": l["images"],
                                "video": l["video"],
                                "tags": l["tags"]
                            } for l in lineups
                        ]
                    })
                pbar.update(1)

    with open("valorant_lineups.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Scraping complete. Results saved to valorant_lineups.json")

if __name__ == "__main__":
    main()
