from django.urls import path
from .views import jells

from django.urls import path
from . import views

urlpatterns = [
    path("albertpark", views.albertpark),
    path("jellspark", views.jellspark),
    path("bendigo", views.bendigo),
]