from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/ngos/', include('apps.ngos.urls')),
    path('api/v1/programs/', include('apps.programs.urls')),
    path('api/v1/participation/', include('apps.participation.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/certificates/', include('apps.certificates.urls')),
    path('api/v1/activity/', include('apps.activity.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)