import json
import re

import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


RESULTSHUB_URL = "https://athsvic.resultshub.com.au/php/resultsFileFetch.php"


ROUND_CONFIG = {
    1: {
        "slug": "albertpark",
        "venue_name": "Albert Park",
    },
    2: {
        "slug": "jellspark",
        "venue_name": "Jells Park",
    },
    3: {
        "slug": "bendigo",
        "venue_name": "Bendigo",
    },
}


def clean_value(value):
    """
    Normalize common ResultHub empty values.
    """
    if value in ("undefined", ""):
        return None

    return value


def clean_row(row):
    """
    Clean a parsed ResultHub row.

    Most ResultHub arrays contain dictionaries, but this keeps the parser safe
    if an array ever contains a primitive value.
    """
    if not isinstance(row, dict):
        return row

    return {
        key: clean_value(value)
        for key, value in row.items()
    }


def parse_js_arrays(text):
    """
    Convert ResultHub's JavaScript-style data feed into JSON-like Python data.

    ResultHub returns data like:

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


def build_resultshub_params(round_number):
    return {
        "season": "2026",
        "series": "xcr",
        "round": str(round_number),
        "venue": "all",
    }


def fetch_resultshub_round(round_number):
    """
    Fetch and parse one Athletics Victoria XCR round from ResultHub.
    """
    round_config = ROUND_CONFIG.get(round_number, {})

    response = requests.get(
        RESULTSHUB_URL,
        params=build_resultshub_params(round_number),
        timeout=10,
    )
    response.raise_for_status()

    tables = parse_js_arrays(response.text)

    return {
        "source_url": response.url,
        "season": "2026",
        "series": "xcr",
        "round": round_number,
        "venue_slug": round_config.get("slug"),
        "venue_name": round_config.get("venue_name"),
        "table_count": len(tables),
        "tables": tables,
    }


def resultshub_round_response(round_number):
    """
    Convert Python/network/parser errors into JSON responses.

    This prevents Vercel from showing a generic serverless crash page and gives
    you a useful JSON error instead.
    """
    try:
        data = fetch_resultshub_round(round_number)
        return Response(data)

    except requests.Timeout:
        return Response(
            {
                "error": "Request to ResultHub timed out.",
                "type": "Timeout",
                "round": round_number,
            },
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )

    except requests.RequestException as e:
        return Response(
            {
                "error": str(e),
                "type": type(e).__name__,
                "round": round_number,
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    except Exception as e:
        return Response(
            {
                "error": str(e),
                "type": type(e).__name__,
                "round": round_number,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def health(request):
    return Response(
        {
            "status": "ok",
            "service": "athletics-victoria-api",
        }
    )


@api_view(["GET"])
def albertpark(request):
    return resultshub_round_response(1)


@api_view(["GET"])
def jellspark(request):
    return resultshub_round_response(2)


@api_view(["GET"])
def bendigo(request):
    return resultshub_round_response(3)


@api_view(["GET"])
def results_by_round(request, round_number):
    return resultshub_round_response(round_number)