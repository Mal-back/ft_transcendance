# Generated by Django 5.1 on 2024-11-09 17:16

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='C4RemoteGame',
            fields=[
                ('game_id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, unique=True)),
                ('player_1_name', models.CharField(max_length=100)),
                ('player_2_name', models.CharField(max_length=100)),
                ('player_1_connected', models.BooleanField(default=False)),
                ('player_2_connected', models.BooleanField(default=False)),
            ],
        ),
    ]
