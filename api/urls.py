from django.urls import path
from . import views

urlpatterns = [
    path("health", views.health),
    path("results", views.results),
    path("athletes/results", views.athlete_results),
    path("athletes/compare", views.compare_athletes_view),
]