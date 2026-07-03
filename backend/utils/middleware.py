"""
Custom middleware for the NGO platform.
"""
import logging
import time

logger = logging.getLogger('apps')


class AuditMiddleware:
    """
    Attach request metadata to thread-local storage so audit logs
    can capture IP address and user without passing request everywhere.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request._start_time = time.time()
        response = self.get_response(request)

        duration_ms = round((time.time() - request._start_time) * 1000)
        if request.path.startswith('/api/') and response.status_code >= 400:
            logger.warning(
                f"{request.method} {request.path} -> {response.status_code} "
                f"({duration_ms}ms) user={getattr(request.user, 'id', 'anon')}"
            )

        return response


def get_client_ip(request):
    """Extract the real client IP from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
