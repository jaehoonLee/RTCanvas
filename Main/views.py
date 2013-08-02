# -*- coding:utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
from django.core import serializers
from Main.models import *

import json, time
import threading

# Init Function
def init():
    #Room Participant Check
    participant_thread = threading.Thread(target=update_participant)
    participant_thread.start()

def update_participant():
    # print threading.enumerate()

    rooms = CanvasRoom.objects.all()
    for room in rooms:
        CanvasRoom.objects.delete_participant(id=room.id)
    time.sleep(2)
    participant_thread = threading.Thread(target=update_participant)
    participant_thread.start()

# Create your views here.
def main(request):
    return render_to_response('main.html', RequestContext(request))


def about(request):
    return render_to_response('about.html', RequestContext(request))


def repository(request):
    return render_to_response('repository.html', RequestContext(request))


def canvasroom(request):
    rooms = CanvasRoom.objects.all()

    return render_to_response('canvasroom.html', RequestContext(request, {'rooms': rooms}))


def canvas(request):
    return render_to_response('canvas.html', RequestContext(request, {'title': '재훈의 그림방'}))


def canvas_enter(request, room, participant):
    return render_to_response('canvas.html', RequestContext(request, {'title': room.name,
                                                                      'participants': room.participant_set.all(),
                                                                      'partiName' : participant.name,
                                                                      'partiID': participant.id}))

#model
def register_room(request):
    room = CanvasRoom.objects.create_room(request.POST['name'], request.POST['password'])
    return canvas_enter(request, room, 1)


def register_participant(request):
    room = CanvasRoom.objects.get(id=int(request.POST['id']))
    participant = Participant.objects.create_participant(request.POST['name'], room)
    return canvas_enter(request, room, participant)


def get_participant(request):
    #Update Participant
    Participant.objects.update_participant(id=int(request.POST['partiID']))

    #Return Participants
    room = CanvasRoom.objects.get(id=int(request.POST['id']))
    participants = room.participant_set.all()

    member = []
    for participant in participants:
        member.append(participant.name)
    json_str = json.dumps(member, encoding='utf-8')
    return HttpResponse(json_str)

#Socketio
def socketio(request):
    return render_to_response('socket.io.js', RequestContext(request))


#Mobile
def getRoom(request):
    rooms = CanvasRoom.objects.all()
    data = serializers.serialize("json", rooms, fields=('name'))
    # json_str = json.dumps(rooms, encoding='utf-8')
    return HttpResponse(data)