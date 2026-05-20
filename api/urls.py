from django.urls import path
from .views import jells

urlpatterns = [
    path("jells", jells),
]