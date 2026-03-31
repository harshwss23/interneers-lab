from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def hello_world(request):
    return HttpResponse("Hello, world! This is our interneers-lab Django server.")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('hello/', hello_world),
    path("api/accounts/", include("accounts.urls")),
    path("api/warehouses/", include("warehouses.urls")),
    path("api/", include("greet.adapters.in_http.urls")),
    path("api/", include("products.urls")),
]
