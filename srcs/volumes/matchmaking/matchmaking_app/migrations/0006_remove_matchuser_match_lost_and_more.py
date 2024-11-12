# Generated by Django 5.1 on 2024-11-12 15:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matchmaking_app', '0005_alter_tournament_invited_players'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='matchuser',
            name='match_lost',
        ),
        migrations.RemoveField(
            model_name='matchuser',
            name='match_won',
        ),
        migrations.AddField(
            model_name='matchuser',
            name='c4_match_lost',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='matchuser',
            name='c4_match_won',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='matchuser',
            name='pong_match_lost',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='matchuser',
            name='pong_match_won',
            field=models.IntegerField(default=0),
        ),
    ]