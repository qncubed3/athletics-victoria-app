from api.services.resultshub_client import fetch_event_results


def parse_relay_members(value):
    if not value:
        return []

    members = []

    for raw_member in value.split("^^"):
        raw_member = raw_member.strip()

        if not raw_member:
            continue

        parts = raw_member.split("|")

        while len(parts) < 6:
            parts.append(None)

        members.append({
            "athlete_id": parts[0],
            "member_flag": parts[1],
            "bib": parts[2],
            "first_name": parts[3],
            "last_name": parts[4],
            "seq_id": parts[5],
        })

    return members


def parse_relay_splits(value):
    if not value:
        return []

    splits = []

    for raw_split in value.split("^^"):
        raw_split = raw_split.strip()

        if not raw_split:
            continue

        parts = raw_split.split("|")

        while len(parts) < 3:
            parts.append(None)

        splits.append({
            "split_flag": parts[0],
            "split": parts[1],
            "split_seconds": parts[2],
        })

    return splits


def get_event_rows(tables):
    event_rows = []

    for table_name, rows in tables.items():
        if table_name.startswith("sessItems_"):
            event_rows.extend(rows)

    return event_rows


def get_relay_result_rows(tables):
    relay_rows = []

    for rows in tables.values():
        for row in rows:
            if isinstance(row, dict) and row.get("RelayMembers"):
                relay_rows.append(row)

    return relay_rows


def build_event_lookup(event_rows):
    return {
        event["EventPtr"]: event
        for event in event_rows
        if event.get("EventPtr")
    }


def build_relay_legs(row):
    members = parse_relay_members(row.get("RelayMembers"))
    splits = parse_relay_splits(row.get("RelaySplits"))

    legs = []

    for i in range(max(len(members), len(splits))):
        member = members[i] if i < len(members) else {}
        split = splits[i] if i < len(splits) else {}

        first_name = member.get("first_name")
        last_name = member.get("last_name")

        legs.append({
            "leg_number": i + 1,
            "athlete_id": member.get("athlete_id"),
            "bib": member.get("bib"),
            "athlete": f"{first_name or ''} {last_name or ''}".strip() or None,
            "split": split.get("split"),
            "split_seconds": split.get("split_seconds"),
        })

    return legs


def build_relay_result(row, event):
    distance = event.get("Distance")
    uom = event.get("UOM")

    return {
        "team": f"{row.get('Affiliation')} {row.get('TeamLtr')}".strip(),
        "affiliation": row.get("Affiliation"),
        "team_id": row.get("TeamId"),
        "team_letter": row.get("TeamLtr"),

        "event_ptr": row.get("EventPtr"),
        "event_number": event.get("EventNbr"),
        "discipline": event.get("Discipline"),
        "event_type": event.get("EventType"),
        "sex": event.get("Sex"),
        "division": event.get("Division"),
        "division_label": event.get("DivAbbr"),
        "event_note": event.get("EventNote"),

        "distance": f"{distance}{uom}" if distance and uom else None,
        "relay_size": event.get("RelaySize"),

        "place": row.get("EventPlace"),
        "heat_place": row.get("HeatPlace"),
        "performance": row.get("PerfDsp"),
        "performance_seconds": row.get("Performance"),
        "points": row.get("Points"),
        "status": row.get("Status"),

        "legs": build_relay_legs(row),
    }


def get_relay_results(
    season="2026",
    series="xcr",
    round_number="2",
    venue="all",
    club=None,
):
    data = fetch_event_results(
        season=season,
        series=series,
        round_number=round_number,
        venue=venue,
    )

    tables = data["tables"]

    event_rows = get_event_rows(tables)
    relay_rows = get_relay_result_rows(tables)
    events_by_ptr = build_event_lookup(event_rows)

    if club:
        club = club.upper()
        relay_rows = [
            row for row in relay_rows
            if row.get("Affiliation") == club
        ]

    relays = []

    for row in relay_rows:
        event = events_by_ptr.get(row.get("EventPtr"), {})
        relays.append(build_relay_result(row, event))

    return {
        "source_url": data["source_url"],
        "season": season,
        "series": series,
        "round": round_number,
        "venue": venue,
        "club": club,
        "relay_count": len(relays),
        "relays": relays,
        "message": None if relays else "No relay results found for this round or club.",
    }