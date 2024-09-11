# Generated by Django 5.1 on 2024-08-25 21:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PublicUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=128, unique=True)),
                ('profilePic', models.URLField()),
                ('is_online', models.BooleanField()),
                ('account_creation', models.DateTimeField(auto_now_add=True)),
                ('last_seen_online', models.DateTimeField(auto_now_add=True)),
                ('single_game_won', models.IntegerField(default=0)),
                ('single_game_lost', models.IntegerField(default=0)),
                ('tournament_game_won', models.IntegerField(default=0)),
                ('tournament_game_lost', models.IntegerField(default=0)),
                ('tounament_won', models.IntegerField(default=0)),
                ('tournament_lost', models.IntegerField(default=0)),
                ('friends', models.ManyToManyField(blank=True, to='users_app.publicuser')),
            ],
        ),
    ]