# Generated by Django 5.1 on 2024-11-05 15:00

import django.db.models.deletion
import django.utils.timezone
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
                ('last_online_update', models.DateTimeField(null=True)),
                ('match_won', models.IntegerField(default=0)),
                ('match_lost', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='InQueueUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('win_rate', models.FloatField()),
                ('range_to_search', models.FloatField(default=0.05)),
                ('last_range_update', models.DateTimeField(default=django.utils.timezone.now)),
                ('game_type', models.TextField(choices=[('pong', 'Pong'), ('connect_four', 'Connect four')])),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='user_in_queue', to='matchmaking_app.matchuser', to_field='username')),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_round', models.IntegerField(default=1)),
                ('game_type', models.TextField(choices=[('pong', 'Pong'), ('connect_four', 'Connect four')])),
                ('status', models.TextField(choices=[('pending', 'Pending'), ('in_progess', 'In progress')], default='pending', max_length=20)),
                ('invited_players', models.ManyToManyField(related_name='invited_players', to='matchmaking_app.matchuser')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tournament_owner', to='matchmaking_app.matchuser', to_field='username')),
                ('winner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='winner', to='matchmaking_app.matchuser')),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1_points', models.IntegerField(default=0)),
                ('player2_points', models.IntegerField(default=0)),
                ('game_type', models.TextField(choices=[('pong', 'Pong'), ('connect_four', 'Connect four')])),
                ('matchId', models.UUIDField(null=True)),
                ('status', models.TextField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined'), ('cancelled', 'Cancelled'), ('in_progess', 'In progress'), ('finished', 'Finished')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='matches_as_p1', to='matchmaking_app.matchuser', to_field='username')),
                ('player2', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='matches_as_p2', to='matchmaking_app.matchuser', to_field='username')),
                ('tournament', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tournament', to='matchmaking_app.tournament')),
            ],
        ),
        migrations.CreateModel(
            name='TournamentUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('matches_won', models.IntegerField(default=0)),
                ('matches_lost', models.IntegerField(default=0)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='confirmed_players', to='matchmaking_app.tournament')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tournament_user', to='matchmaking_app.matchuser', to_field='username')),
            ],
        ),
    ]
