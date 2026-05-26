from django.urls import path
from . import views

urlpatterns = [
    path("health", views.health),
    path("results", views.results),
    path("athletes/results", views.athlete_results),
    path("athletes/compare", views.compare_athletes_view),
    path("athletes", views.athletes),
    path("affiliations", views.affiliations),
    path("relays", views.relays),
    path("relays/view", views.relays_view),
    path("events", views.events),
    path("news", views.news),
]