# Generated by Django 5.1 on 2024-10-30 15:00

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
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('winner_points', models.IntegerField(default=0)),
                ('looser_points', models.IntegerField(default=0)),
                ('game_type', models.TextField(choices=[('pong', 'Pong'), ('connect_four', 'Connect four')])),
                ('played_at', models.DateTimeField()),
                ('looser', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='matches_as_p2', to='history_app.matchuser', to_field='username')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='matches_as_p1', to='history_app.matchuser', to_field='username')),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('current_round', models.IntegerField(default=1)),
                ('is_finished', models.BooleanField(default=False)),
                ('confirmed_players', models.ManyToManyField(blank=True, related_name='confirmed_players', to='history_app.matchuser')),
                ('invited_players', models.ManyToManyField(blank=True, related_name='invited_players', to='history_app.matchuser')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='winner', to='history_app.matchuser')),
            ],
        ),
    ]
