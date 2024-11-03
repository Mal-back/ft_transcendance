# Generated by Django 5.1 on 2024-11-03 14:45

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
                ('profilePic', models.URLField(default='/media/default_avatars/default_00.jpg')),
                ('account_creation', models.DateTimeField(auto_now_add=True)),
                ('last_seen_online', models.DateTimeField(null=True)),
                ('single_games_won', models.IntegerField(default=0)),
                ('single_games_lost', models.IntegerField(default=0)),
                ('tournament_games_won', models.IntegerField(default=0)),
                ('tournament_games_lost', models.IntegerField(default=0)),
                ('tournaments_won', models.IntegerField(default=0)),
                ('tournaments_lost', models.IntegerField(default=0)),
                ('friends', models.ManyToManyField(blank=True, to='users_app.publicuser')),
            ],
        ),
    ]
