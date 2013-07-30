from django.shortcuts import render_to_response
from django.template import RequestContext

# Create your views here.
def main(request):
    return render_to_response('main.html', RequestContext(request));

def about(request):
    return render_to_response('about.html', RequestContext(request));

def repository(request):
    return render_to_response('repository.html', RequestContext(request));

