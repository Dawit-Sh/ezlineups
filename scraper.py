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
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
    "Referer": BASE_URL
}

AGENTS = [
    'Astra', 'Breach', 'Brimstone', 'Chamber', 'Clove', 'Cypher', 'Deadlock',
    'Fade', 'Gekko', 'Harbor', 'KAYO', 'Killjoy', 'Neon', 'Omen', 'Phoenix',
    'Raze', 'Sage', 'Skye', 'Sova', 'Tejo', 'Veto', 'Viper', 'Vyse', 'Waylay', 'Yoru'
]

MAPS = [
    'Abyss', 'Ascent', 'Bind', 'Breeze', 'Corrode', 'Fracture',
    'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset'
]

AGENT_ABILITIES = {
    'Sova': ['Owl Drone', 'Shock Bolt', 'Recon Bolt', 'Hunters Fury'],
    # (keep the rest as-is from your original script)
}

ABILITY_TO_AGENT = {}
for agent, abilities in AGENT_ABILITIES.items():
    for ability in abilities:
        ABILITY_TO_AGENT[ability.replace(' ', '_').replace('/', '_')] = agent


def make_request(url, payload, retries=3):
    for attempt in range(retries):
        try:
            response = requests.post(url, json=payload, headers=HEADERS, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(2 ** attempt)
    return None


def extract_lineup_tags(details, result):
    """
    Safely extract ability tags from both string and list formats.
    """
    abilities_data = details.get('abilities', result.get('abilities', []))

    if isinstance(abilities_data, str):
        lineup_tags = abilities_data.split(':')

    elif isinstance(abilities_data, list):
        lineup_tags = []
        for ab in abilities_data:
            if isinstance(ab, dict):
                name = ab.get('ability') or ab.get('name')
                if name:
                    lineup_tags.append(name)

    else:
        lineup_tags = []

    return [tag.strip() for tag in lineup_tags if tag and tag.strip()]


def scrape_lineups_for_combination(agent, map_name):
    all_lineups = {}

    agent_abilities_set = set(
        a.replace(' ', '_').replace('/', '_')
        for a in AGENT_ABILITIES.get(agent, [])
    )

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

        items = results_data.get('results', []) + results_data.get('setups', [])
        if not items:
            break

        logger.info(f"{agent} @ {map_name} → {len(items)} items")

        for result in tqdm(items, desc=f"{agent} @ {map_name}", leave=False):
            lineup_id = result['id']
            is_setup = result.get('type') == 'setup'
            item_key = f"{'setup' if is_setup else 'lineup'}_{lineup_id}"

            if item_key in all_lineups:
                continue

            detail_url = GET_SETUP_URL if is_setup else GET_LINEUP_URL
            detail_payload = (
                {"setup_id": lineup_id, "user_token": None}
                if is_setup else
                {"id": lineup_id, "user_token": None}
            )

            details = make_request(detail_url, detail_payload)
            if not details:
                continue

            # ✅ FIXED HERE
            lineup_tags = extract_lineup_tags(details, result)

            lineup_abilities_normalized = set(
                t.replace(' ', '_').replace('/', '_') for t in lineup_tags
            )

            if not (lineup_abilities_normalized & agent_abilities_set):
                continue

            # Images
            if is_setup:
                image_urls = [f"{BASE_URL}/static/setup_images/{lineup_id}/cover.webp"]

                if isinstance(details.get('abilities'), list):
                    for idx, ab in enumerate(details['abilities']):
                        for img_idx in range(ab.get('num_images', 0)):
                            image_urls.append(
                                f"{BASE_URL}/static/setup_images/{lineup_id}/images/{idx+1}/{img_idx+1}.webp"
                            )
            else:
                num_images = details.get('images', result.get('num_images', 1))
                image_urls = [
                    f"{BASE_URL}/static/lineup_images/{lineup_id}/{i+1}.webp"
                    for i in range(num_images)
                ]

            all_lineups[item_key] = {
                "title": details.get('title', result.get('title', 'Unknown')),
                "description": details.get('description', '')
                    .replace('&lt;br&gt;', '\n')
                    .replace('<br>', '\n')
                    .replace('&#34;', '"')
                    .replace('&#39;', "'"),
                "images": image_urls,
                "video": details.get('video_url'),
                "tags": lineup_tags
            }

            time.sleep(0.05)

        if len(items) < num_per_page:
            break

        start_results += num_per_page

    return list(all_lineups.values())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent")
    parser.add_argument("--map")
    args = parser.parse_args()

    agents_to_scrape = [args.agent] if args.agent else AGENTS
    maps_to_scrape = [args.map] if args.map else MAPS

    output_data = []

    total = len(agents_to_scrape) * len(maps_to_scrape)

    with tqdm(total=total, desc="Overall Progress") as pbar:
        for agent in agents_to_scrape:
            for map_name in maps_to_scrape:
                lineups = scrape_lineups_for_combination(agent, map_name)

                if lineups:
                    output_data.append({
                        "agent": agent,
                        "map": map_name,
                        "lineups": lineups
                    })

                pbar.update(1)

    with open("./data/valorant_lineups.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    logger.info("Done!")


if __name__ == "__main__":
    main()
