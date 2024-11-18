# Generated by Django 5.1 on 2024-11-18 13:59

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
                ('game_type', models.TextField(choices=[('pong', 'Pong'), ('c4', 'Connect four')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('winner_points', models.IntegerField(default=0)),
                ('looser_points', models.IntegerField(default=0)),
                ('game_type', models.TextField(choices=[('pong', 'Pong'), ('c4', 'Connect four')])),
                ('played_at', models.DateTimeField(auto_now_add=True)),
                ('looser', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='looser', to='history_app.matchuser', to_field='username')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='winner', to='history_app.matchuser', to_field='username')),
            ],
        ),
        migrations.CreateModel(
            name='TournamentUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('matches_won', models.IntegerField()),
                ('matches_lost', models.IntegerField()),
                ('games_played', models.IntegerField()),
                ('user_profile', models.CharField(null=True)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='final_ranking', to='history_app.tournament')),
                ('username', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='user', to='history_app.matchuser', to_field='username')),
            ],
        ),
    ]
