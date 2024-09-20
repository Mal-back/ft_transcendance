# Generated by Django 5.1 on 2024-09-20 14:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MatchUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=128, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('current_round', models.IntegerField(default=1)),
                ('is_finished', models.BooleanField(default=False)),
                ('confirmed_players', models.ManyToManyField(blank=True, related_name='confirmed_players', to='matchmaking_app.matchuser')),
                ('invited_players', models.ManyToManyField(blank=True, related_name='invited_players', to='matchmaking_app.matchuser')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='winner', to='matchmaking_app.matchuser')),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1_points', models.IntegerField(default=0)),
                ('player2_points', models.IntegerField(default=0)),
                ('matchId', models.IntegerField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='matches_as_p1', to='matchmaking_app.matchuser')),
                ('player2', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='matches_as_p2', to='matchmaking_app.matchuser')),
                ('tournament', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tournament', to='matchmaking_app.tournament')),
            ],
        ),
    ]
