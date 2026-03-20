# Valorant Lineups Scraper

A robust Python-based web scraper for [lineupsvalorant.com](https://lineupsvalorant.com). Extract agent-specific and map-specific lineups with full descriptions, images, and tags.

## Features

- **Full Extraction**: Handles both lineups and setups.
- **Pagination**: Automatically crawls all available results.
- **Multi-Agent Support**: Captures lineups shared by multiple agents.
- **CLI Support**: Filter results by agent or map.
- **Rate Limited**: Respects site boundaries with Throttling and retries.

## Installation

```bash
pip install -r requirements.txt
```

## Usage

Scrape all lineups:
```bash
python scraper.py
```

Scrape a specific agent or map:
```bash
python scraper.py --agent Sova --map Ascent
```

## Data Structure

Results are saved to `data/lineups.json` in the following format:

```json
[
  {
    "agent": "Sova",
    "map": "Ascent",
    "lineups": [
      {
        "title": "A Site Recon",
        "description": "...",
        "images": ["url1", "url2"],
        "video": "url",
        "tags": ["Shock Bolt"]
      }
    ]
  }
]
```
