from django.apps import AppConfig;


class ProductsConfig(AppConfig):
    name = 'products'

    def ready(self):
        # Data seeding is disabled for clean production-ready state
        pass
