# Generated by Django 5.1 on 2024-11-05 16:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('history_app', '0002_alter_match_played_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='game_type',
            field=models.TextField(choices=[('pong', 'Pong'), ('c4', 'Connect four')]),
        ),
    ]
