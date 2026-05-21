from django.urls import path
from .views import albertpark, jellspark, bendigo, health

urlpatterns = [
    path("health", health),
    path("albertpark", albertpark),
    path("jellspark", jellspark),
    path("bendigo", bendigo),
]