# Generated by Django 5.1 on 2024-11-10 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matchmaking_app', '0003_remove_match_round_schedule_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='winner',
        ),
        migrations.AddField(
            model_name='tournament',
            name='historyId',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='tournament',
            name='status',
            field=models.TextField(choices=[('pending', 'Pending'), ('in_progress', 'In progress'), ('finished', 'Finished')], default='pending', max_length=20),
        ),
    ]
