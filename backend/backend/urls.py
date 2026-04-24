from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('hexgame.urls')),
    path('admin/', admin.site.urls),
    path(
        'sw.js', 
        TemplateView.as_view(
            template_name='hexgame/sw.js', 
            content_type='application/javascript'
        ), name='sw.js'),
]

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
