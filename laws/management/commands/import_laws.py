import json
from django.core.management.base import BaseCommand
from laws.models import Law 

class Command(BaseCommand):
    help = 'Naye JSON file se laws ko database mein import karne ki script'

    def handle(self, *args, **kwargs):
        file_path = 'law.json'

        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                # Yeh line purana saara kachra saaf kar degi
                self.stdout.write("Purana data delete ho raha hai...")
                Law.objects.all().delete()
                
                self.stdout.write(f"Total {len(data)} naye records mile hain. Import shuru ho raha hai...")
                
                count = 0
                for item in data:
                    Law.objects.create(
                        topic=item.get('topic', 'No Topic'),
                        source=item.get('source', ''),
                        summary=item.get('summary', ''),
                        text=item.get('text', '')
                    )
                    count += 1
                    
            self.stdout.write(self.style.SUCCESS(f'Zabardast! {count} naye laws successfully database mein save ho gaye hain.'))
            
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('Error: laws_data.json file nahi mili.'))