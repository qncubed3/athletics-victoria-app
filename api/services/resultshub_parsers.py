import re
import json
from bs4 import BeautifulSoup

def clean_value(value):
    """
    Normalize common empty values.
    """
    if value in ("undefined", ""):
        return None

    return value

def clean_row(row):
    """
    Clean a parsed row.
    """
    if not isinstance(row, dict):
        return row

    return {
        key: clean_value(value)
        for key, value in row.items()
    }

def parse_js_arrays(text):
    """
    Convert JavaScript-style data feed into JSON-like Python data.

    Example:

        Signature_AlbertPark = [{...}];
        sessions_AlbertPark = [{...}];
        athletes_AlbertPark = [{...}];

    This function extracts each variable assignment and parses the array.
    """
    pattern = r"([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\[.*?\]);"
    matches = re.findall(pattern, text, flags=re.DOTALL)

    tables = {}

    for table_name, array_text in matches:
        try:
            rows = json.loads(array_text)
            tables[table_name] = [clean_row(row) for row in rows]

        except json.JSONDecodeError as e:
            tables[table_name] = {
                "error": f"Could not parse table '{table_name}'",
                "details": str(e),
            }

    return tables


def parse_athlete_results_html(html):
    soup = BeautifulSoup(html, "html.parser")

    rows = soup.find_all("tr")

    athlete_info = {}
    results = []

    for i, row in enumerate(rows):
        cells = [cell.get_text(strip=True) for cell in row.find_all(["td", "th"])]

        if not cells:
            continue

        # First row contains athlete metadata
        if i == 0:
            summary_text = cells[0]

            athlete_match = re.search(r"Athlete:\s*(.*?)\.", summary_text)
            club_match = re.search(r"Club:\s*(.*?)\.", summary_text)
            bib_match = re.search(r"(\d{4})\s+Bib:\s*(.*?)\.", summary_text)
            age_match = re.search(r"Recent result age:\s*(.*?)$", summary_text)

            athlete_info = {
                "athlete": athlete_match.group(1).strip() if athlete_match else None,
                "club": club_match.group(1).strip() if club_match else None,
                "bib_year": bib_match.group(1).strip() if bib_match else None,
                "bib": bib_match.group(2).strip() if bib_match else None,
                "recent_result_age": age_match.group(1).strip() if age_match else None,
            }

            continue

        # Result rows:
        # [date, event, specification, performance, wind, venue]
        if len(cells) >= 6 and cells[0].startswith("20"):
            results.append({
                "meet_date": cells[0],
                "venue": cells[5],
                "event": cells[1],
                "performance": cells[3] or None,
                "event_specification": cells[2] or None,
                "wind": cells[4].replace("(", "").replace(")", "").strip() or None,
            })

    return {
        "athlete_info": athlete_info,
        "results": results,
    }