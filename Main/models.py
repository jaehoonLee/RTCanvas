from django.db import models
from django.contrib import admin
import datetime
from django.utils.timezone import utc
from django.contrib.auth.models import *

# Create your models here.
class CanvasRoomManager(models.Manager):
    def create_room(self, name, password):
        room = self.model(name=name, password=password)
        room.save()
        return room

    def delete_empty_room(self, id):
        rooms = self.all()
        for room in rooms:
            if len(room) == 0:
                room.delete()

    def delete_participant(self, id):
        room = self.filter(id=id)
        if len(room) == 0 :
            return
        participants = room[0].participant_set.all()
        now = datetime.datetime.utcnow().replace(tzinfo=utc)
        for participant in participants :
            if (now - participant.updateTime).total_seconds() > 2 :
                participant.delete()




class CanvasRoom(models.Model):
    name = models.CharField(max_length=30)
    password = models.CharField(max_length=50)
    objects = CanvasRoomManager()

class CanvasRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'password')
admin.site.register(CanvasRoom, CanvasRoomAdmin)


class ParticipantManager(models.Manager):
    def create_participant(self, name, room):
        participant = self.model(name=name)
        participant.room = room
        participant.save()
        return participant

    def update_participant(self, id):
        participant = self.get(id=id)
        participant.save()
        return participant


class Participant(models.Model):
    name = models.CharField(max_length=30)
    createTime = models.DateTimeField(auto_now_add = True)
    updateTime = models.DateTimeField(auto_now = True)
    room = models.ForeignKey(CanvasRoom)
    objects = ParticipantManager()

class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'get_room')
    def get_room(self, obj):
        return obj.room.name
admin.site.register(Participant, ParticipantAdmin)