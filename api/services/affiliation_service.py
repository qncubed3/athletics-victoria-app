from api.services.resultshub_client import fetch_resultshub_data
from api.services.resultshub_parsers import parse_js_arrays


def fetch_affiliations():
    raw = fetch_resultshub_data(
        "db/select_affiliations.php",
        {},
    )

    tables = parse_js_arrays(raw["raw_text"])

    return {
        "source_url": raw["source_url"],
        "affiliations": [
            affiliation["AffilCode"]
            for affiliation in tables["affiliations"]
        ],
    }