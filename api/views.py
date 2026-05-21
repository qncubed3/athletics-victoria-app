import re
import json
import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


RESULTSHUB_URL = "https://athsvic.resultshub.com.au/php/resultsFileFetch.php"


def clean_value(value):
    if value in ("undefined", ""):
        return None
    return value


def parse_js_arrays(text):
    """
    Parses ResultHub response like:

        Signature_AlbertPark = [{...}];
        sessions_AlbertPark = [{...}];
        athletes_AlbertPark = [{...}];

    into:

        {
            "Signature_AlbertPark": [...],
            "sessions_AlbertPark": [...],
            "athletes_AlbertPark": [...]
        }
    """
    pattern = r"([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\[.*?\]);"
    matches = re.findall(pattern, text, flags=re.DOTALL)

    tables = {}

    for name, array_text in matches:
        try:
            rows = json.loads(array_text)

            cleaned_rows = []
            for row in rows:
                cleaned_rows.append({
                    key: clean_value(value)
                    for key, value in row.items()
                })

            tables[name] = cleaned_rows

        except json.JSONDecodeError as e:
            tables[name] = {
                "error": f"Could not parse table {name}",
                "details": str(e),
            }

    return tables

def fetch_round(round_number):
    params = {
        "season": "2026",
        "series": "xcr",
        "round": str(round_number),
        "venue": "all",
    }

    try:
        res = requests.get(
            RESULTSHUB_URL,
            params=params,
            timeout=30,
        )
        res.raise_for_status()

    except requests.RequestException as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    tables = parse_js_arrays(res.text)

    return Response({
        "source_url": res.url,
        "table_count": len(tables),
        "tables": tables,
    })


@api_view(["GET"])
def albertpark(request):
    return fetch_round(1)


@api_view(["GET"])
def jellspark(request):
    return fetch_round(2)


@api_view(["GET"])
def bendigo(request):
    return fetch_round(3)