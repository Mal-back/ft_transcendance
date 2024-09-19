# Generated by Django 5.1 on 2024-09-19 14:03

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, help_text='Unique ID for this game', primary_key=True, serialize=False),
        ),
    ]
