"""
Cache key builders and invalidation helpers.
"""
from django.core.cache import cache

CACHE_TIMEOUT_DASHBOARD = 300   # 5 minutes
CACHE_TIMEOUT_PROGRAMS = 120    # 2 minutes


def ngo_dashboard_key(ngo_id: int) -> str:
    return f'ngo_dashboard:{ngo_id}'


def volunteer_dashboard_key(volunteer_id: int) -> str:
    return f'volunteer_dashboard:{volunteer_id}'


def invalidate_ngo_dashboard(ngo_id: int) -> None:
    cache.delete(ngo_dashboard_key(ngo_id))


def invalidate_volunteer_dashboard(volunteer_id: int) -> None:
    cache.delete(volunteer_dashboard_key(volunteer_id))


def invalidate_all_volunteer_dashboards() -> None:
    """
    Delete all volunteer dashboard caches.
    Called when program state changes globally (e.g. NGO approved).
    Uses cache.delete_pattern if django-redis is available.
    """
    try:
        cache.delete_pattern('*volunteer_dashboard:*')
    except AttributeError:
        pass  # Fallback: cache will expire naturally


def get_or_set(key: str, callable_fn, timeout: int = 300):
    """
    Retrieve value from cache or compute and store it.
    Returns the cached or freshly computed value.
    """
    value = cache.get(key)
    if value is None:
        value = callable_fn()
        cache.set(key, value, timeout)
    return value
