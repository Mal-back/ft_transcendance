# Generated by Django 5.1 on 2024-08-27 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users_app', '0003_remove_publicuser_tounaments_won_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='publicuser',
            name='is_online',
        ),
        migrations.AlterField(
            model_name='publicuser',
            name='last_seen_online',
            field=models.DateTimeField(null=True),
        ),
    ]