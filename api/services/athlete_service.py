from api.services.resultshub_client import fetch_resultshub_data
from api.services.resultshub_parsers import parse_athlete_results_html, parse_js_arrays


def fetch_athletes():
    raw = fetch_resultshub_data(
        "db/select_athletes.php",
        {},
    )

    tables = parse_js_arrays(raw["raw_text"])
    athletes = tables.get("athletes", [])

    return {
        "source_url": raw["source_url"],
        "athlete_count": len(athletes),
        "athletes": athletes,
    }


def fetch_athlete_results(name):
    raw = fetch_resultshub_data(
        "db/fetch_athResults.php",
        {"athleteName": name},
    )

    parsed = parse_athlete_results_html(raw["raw_text"])

    return {
        "source_url": raw["source_url"],
        "athlete_name": name,
        "data": parsed,
    }


def compare_athletes(name1, name2):
    athlete1 = fetch_athlete_results(name1)
    athlete2 = fetch_athlete_results(name2)

    results1 = athlete1["data"]["results"]
    results2 = athlete2["data"]["results"]

    index2 = {
        (
            result["meet_date"],
            result["event"],
            result["venue"],
        ): result
        for result in results2
    }

    comparisons = []

    athlete1_wins = 0
    athlete2_wins = 0
    ties = 0
    unknown = 0

    for result1 in results1:
        key = (
            result1["meet_date"],
            result1["event"],
            result1["venue"],
        )

        result2 = index2.get(key)

        if result2:
            winner = determine_winner(
                result1["event"],
                result1["performance"],
                result2["performance"],
            )

            if winner == 1:
                athlete1_wins += 1
            elif winner == 2:
                athlete2_wins += 1
            elif winner == 0:
                ties += 1
            else:
                unknown += 1

            comparisons.append({
                "meet_date": result1["meet_date"],
                "event": result1["event"],
                "venue": result1["venue"],
                "athlete1_performance": result1["performance"],
                "athlete2_performance": result2["performance"],
                "winner": winner,
            })

    return {
        "athlete1": name1,
        "athlete2": name2,
        "overlap_count": len(comparisons),

        "summary": {
            "athlete1_wins": athlete1_wins,
            "athlete2_wins": athlete2_wins,
            "ties": ties,
            "unknown": unknown,
        },

        "comparisons": comparisons,
    }


DISTANCE_EVENTS = [
    "shot put",
    "discus",
    "javelin",
    "hammer",
    "long jump",
    "triple jump",
    "high jump",
    "pole vault",
]

# Helper functions

def performance_to_number(performance):
    performance = performance.strip().lower().replace("h", "")

    if performance in ["dnf", "dns", "dq", "nm"]:
        return None

    # Distance event: 6.50m
    if performance.endswith("m"):
        try:
            return float(performance[:-1])
        except:
            return None

    # Time event
    if ":" in performance:
        parts = [float(x) for x in performance.split(":")]

        if len(parts) == 3:
            h, m, s = parts
            return h * 3600 + m * 60 + s

        if len(parts) == 2:
            m, s = parts
            return m * 60 + s

    try:
        return float(performance)
    except:
        return None


def determine_winner(event, athlete1_perf, athlete2_perf):
    val1 = performance_to_number(athlete1_perf)
    val2 = performance_to_number(athlete2_perf)

    if val1 is None or val2 is None:
        return -1

    if val1 == val2:
        return 0

    event = event.lower()

    is_distance_event = any(
        distance_event in event
        for distance_event in DISTANCE_EVENTS
    )

    # Higher is better
    if is_distance_event:
        return 1 if val1 > val2 else 2

    # Lower is better
    return 1 if val1 < val2 else 2