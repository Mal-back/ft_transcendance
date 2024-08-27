from django.utils.timezone import now
from .models import PublicUser

class SetRequestHostMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.META['HTTP_HOST'] = 'localhost:8080'
        request.META['wsgi.url_scheme'] = 'http'
        return self.get_response(request)

class UpdateLastUserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            PublicUser.objects.filter(pk=request.user.pk).update(last_seen_online=now())
            return self.get_response(request)
        return response

