from api.services.resultshub_client import fetch_resultshub_data
from api.services.resultshub_parsers import parse_js_arrays


def fetch_events(season):
    raw = fetch_resultshub_data(
        "configFileFetch.php",
        {"season": season}
    )

    tables = parse_js_arrays(raw["raw_text"])

    return {
        "source_url": raw["source_url"],
        "tables": tables,
    }

def fetch_news(season="2026", series=None):
    
    events_data = fetch_events(season)
    news_items = events_data.get("tables").get("news")

    if series:
        news_items = [
            item for item in news_items
            if item.get("series") == series
        ]

    return {
        "source_url": events_data.get("source_url"),
        "season": season,
        "series": series,
        "news_count": len(news_items),
        "news": news_items,
    }