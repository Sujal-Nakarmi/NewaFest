from django.core.management.base import BaseCommand
from renting.models import DeliveryLocation

class Command(BaseCommand):
    help = 'Load initial delivery locations'

    def handle(self, *args, **options):
        # Bagmati Province locations
        kathmandu_areas = [
            {"metro_area": "Kathmandu Metro 10", "area_name": "New Baneshwor Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 11", "area_name": "Maitighar Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 12", "area_name": "Teku Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 13", "area_name": "Kalimati Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 14", "area_name": "Kuleshwor Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 15", "area_name": "Swayambhu Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 16", "area_name": "Nayabazar Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 17", "area_name": "Chhetrapati Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 18", "area_name": "Raktakali Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 19", "area_name": "Hanumandhoka Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 1", "area_name": "Naxal Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 20", "area_name": "Marutol Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 21", "area_name": "Lagantole Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 22", "area_name": "Newroad Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 23", "area_name": "Basantapur Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 24", "area_name": "Indrachowk Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 25", "area_name": "Ason Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 26", "area_name": "Samakhusi Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 26", "area_name": "Thamel Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 27", "area_name": "Bhotahity Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 28", "area_name": "Bagbazar Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 28", "area_name": "Kamaladi Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 29", "area_name": "Anamnagar Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 29", "area_name": "Putalisadak Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 2", "area_name": "Lazimpat Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 30", "area_name": "Maitidevi Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 31", "area_name": "Min Bhawan Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 32", "area_name": "Koteshwor Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 32", "area_name": "Tinkune Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 3", "area_name": "Baluwatar Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 3", "area_name": "Maharajgunj Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 4", "area_name": "Bishalnagar Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 5", "area_name": "Tangal Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 7", "area_name": "Chabahil Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 8", "area_name": "Gaushala Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 9", "area_name": "Sinamangal Area", "charge": 50},
            {"metro_area": "Kathmandu Outside Ring Road", "area_name": "Sinamangal Area", "charge": 50},



            # New Baneshwor specific areas
            {"metro_area": "Kathmandu Metro 10", "area_name": "Apex College Area - Pipal Bot", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Bijuli Bazar", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Buddhanagar", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Civil Hospital Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Ekta Marg", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "New Baneshwor Chowk", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Ratna Rajya Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Shankhamul Area", "charge": 50},
            {"metro_area": "Kathmandu Metro 10", "area_name": "Thapagaun Area", "charge": 50},

             # Maitighar specific areas
            {"metro_area": "Kathmandu Metro 11", "area_name": "Babarmahal", "charge": 50},
            {"metro_area": "Kathmandu Metro 11", "area_name": "Maitighar", "charge": 50},
            {"metro_area": "Kathmandu Metro 11", "area_name": "Shahid Gate", "charge": 50},
            {"metro_area": "Kathmandu Metro 11", "area_name": "Thapathali", "charge": 50},
            {"metro_area": "Kathmandu Metro 11", "area_name": "Tripureswor", "charge": 50},

            # Teku specific areas
            {"metro_area": "Kathmandu Metro 12", "area_name": "Teku", "charge": 50},

            # Kalimati specific areas
            {"metro_area": "Kathmandu Metro 13", "area_name": "Bafal", "charge": 50},
            {"metro_area": "Kathmandu Metro 13", "area_name": "Kalimati", "charge": 50},
            {"metro_area": "Kathmandu Metro 13", "area_name": "Soalteemode", "charge": 50},
            {"metro_area": "Kathmandu Metro 13", "area_name": "Tahachal", "charge": 50},
            {"metro_area": "Kathmandu Metro 13", "area_name": "Tankeshwor", "charge": 50},


            # Kuleshwor specific areas
            {"metro_area": "Kathmandu Metro 14", "area_name": "Balkhu", "charge": 50},
            {"metro_area": "Kathmandu Metro 14", "area_name": "Kalanki Chowk", "charge": 50},
            {"metro_area": "Kathmandu Metro 14", "area_name": "Kuleshwor", "charge": 50},
            {"metro_area": "Kathmandu Metro 14", "area_name": "Ravi Bhawan", "charge": 50},

             # Swa specific areas
            {"metro_area": "Kathmandu Metro 15", "area_name": "Bahiti", "charge": 50},
            {"metro_area": "Kathmandu Metro 15", "area_name": "Bijeshwori", "charge": 50},
            {"metro_area": "Kathmandu Metro 15", "area_name": "Chhauni", "charge": 50},
            {"metro_area": "Kathmandu Metro 15", "area_name": "Dallu", "charge": 50},
            {"metro_area": "Kathmandu Metro 15", "area_name": "Kimdol", "charge": 50},
            {"metro_area": "Kathmandu Metro 15", "area_name": "Sobhabhagwati", "charge": 50},

           

    
            
        ]
        
        for area in kathmandu_areas:
            DeliveryLocation.objects.get_or_create(
                province="Bagmati Province",
                metro_area=area["metro_area"],
                area_name=area["area_name"],
                defaults={
                    'delivery_charge': area["charge"],
                    'is_available': True
                }
            )
            
        self.stdout.write(self.style.SUCCESS('Successfully loaded delivery locations'))