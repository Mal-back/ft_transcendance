# Generated by Django 5.1 on 2024-10-29 07:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth_app', '0002_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='last_log',
            field=models.DateTimeField(auto_now=True),
        ),
    ]