import os

import certifi
import requests
from api.services.resultshub_parsers import parse_js_arrays

BASE_URL = "https://athsvic.resultshub.com.au/php"


def _requests_verify():
    """
    SSL verification for upstream ResultsHub requests.

    - RESULTSHUB_SSL_VERIFY=1 forces verification (certifi CA bundle).
    - RESULTSHUB_SSL_VERIFY=0 disables verification (local dev only).
    - Default: verify on Vercel/Linux; skip on Windows (common CA bundle issue).
    """
    override = os.environ.get("RESULTSHUB_SSL_VERIFY")
    if override is not None:
        return override.lower() not in ("0", "false", "no")
    if os.environ.get("VERCEL"):
        return certifi.where()
    if os.name == "nt":
        return False
    return certifi.where()


def fetch_resultshub_data(path, params=None):
    url = f"{BASE_URL}/{path}"

    response = requests.get(
        url,
        params=params,
        timeout=10,
        verify=_requests_verify(),
    )
    response.raise_for_status()

    return {
        "source_url": response.url,
        "raw_text": response.text,
    }   


def fetch_event_results(season="2026", series="xcr", round_number="1", venue="all"):
    raw = fetch_resultshub_data(
        "resultsFileFetch.php",
        {
            "season": season,
            "series": series,
            "round": round_number,
            "venue": venue,
        },
    )

    tables = parse_js_arrays(raw["raw_text"])

    return {
        "source_url": raw["source_url"],
        "season": season,
        "series": series,
        "round": round_number,
        "venue": venue,
        "table_count": len(tables),
        "tables": tables,
    }







