from django.http import JsonResponse
from apps.contracts.api_contracts import api_error

class ExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            return self.get_response(request)
        except Exception as e:
            return JsonResponse(api_error(str(e)), status=500)
