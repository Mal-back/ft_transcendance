# Generated by Django 5.1 on 2024-10-27 11:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matchmaking_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='tournament',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tournament', to='matchmaking_app.tournament'),
        ),
        migrations.AlterField(
            model_name='match',
            name='game_type',
            field=models.URLField(choices=[('pong', 'Pong'), ('connect_four', 'Connect four')]),
        ),
        migrations.AlterField(
            model_name='match',
            name='matchId',
            field=models.UUIDField(null=True),
        ),
    ]
