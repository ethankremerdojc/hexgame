from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

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
