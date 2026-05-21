import requests
from rest_framework import status
from rest_framework.response import Response



def handle_service_call(service_func, *args, **kwargs):
    try:
        return Response(service_func(*args, **kwargs))

    except requests.Timeout:
        return Response(
            {"error": "Upstream ResultHub request timed out."},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )

    except requests.RequestException as e:
        return Response(
            {"error": str(e), "type": type(e).__name__},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    except Exception as e:
        return Response(
            {"error": str(e), "type": type(e).__name__},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )