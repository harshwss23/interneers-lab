from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=80)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    brand = models.CharField(max_length=80, blank=True)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return self.name