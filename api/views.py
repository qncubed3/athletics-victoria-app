from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.services.athlete_service import (
    fetch_athlete_results,
    compare_athletes,
)


from .services.resultshub_client import (
    fetch_event_results,
    
)

from .services.affiliation_service import fetch_affiliations
from .services.relay_service import get_relay_results

from .utils import handle_service_call


@api_view(["GET"])
def health(request):
    return Response({
        "status": "ok",
        "service": "athletics-victoria-api",
    })


# @api_view(["GET"])
# def config(request):
#     season = request.GET.get("season", "2025")

#     return handle_service_call(
#         fetch_config,
#         season=season,
#     )

@api_view(["GET"])
def health(request):
    return Response({
        "status": "ok",
        "service": "athletics-victoria-api",
    })

@api_view(["GET"])
def affiliations(request):
    return handle_service_call(fetch_affiliations)

@api_view(["GET"])
def results(request):
    season = request.GET.get("season", "2026")
    series = request.GET.get("series", "xcr")
    round_number = request.GET.get("round", "1")
    venue = request.GET.get("venue", "all")

    return handle_service_call(
        fetch_event_results,
        season=season,
        series=series,
        round_number=round_number,
        venue=venue,
    )


@api_view(["GET"])
def athlete_results(request):
    name = request.GET.get("name")

    if not name:
        return Response(
            {"error": "Missing required query parameter: name"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return handle_service_call(
        fetch_athlete_results,
        name=name,
    )


@api_view(["GET"])
def compare_athletes_view(request):
    name1 = request.GET.get("name1")
    name2 = request.GET.get("name2")

    if not name1 or not name2:
        return Response(
            {"error": "Missing athlete names"},
            status=400,
        )

    return handle_service_call(
        compare_athletes,
        name1=name1,
        name2=name2,
    )

@api_view(["GET"])
def relays(request):
    season = request.GET.get("season", "2026")
    series = request.GET.get("series", "xcr")
    round_number = request.GET.get("round", "2")
    venue = request.GET.get("venue", "all")
    club = request.GET.get("club")

    return handle_service_call(
        get_relay_results,
        season=season,
        series=series,
        round_number=round_number,
        venue=venue,
        club=club,
    )

from django.shortcuts import render


def relays_view(request):
    return render(request, "api/relays.html")