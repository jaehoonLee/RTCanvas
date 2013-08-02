from django.conf.urls import patterns, include, url
from django.contrib import admin
from Main.views import *
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic import RedirectView

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:

    # url(r'^blog/', include('blog.urls')),
    url(r'^$', main),
    url(r'^about$', about),
    url(r'^repository$', repository),
    url(r'^room$', canvasroom),
    url(r'^canvas$', canvas),
    url(r'^admin/', include(admin.site.urls)),

    #DB
    url(r'^registerRoom/', register_room),
    url(r'^register_participant/', register_participant),
    url(r'^get_participant/', get_participant),


    # url(r'^socket.io/socket.io.js/', RedirectView.as_view(url='/static/js/socket.io.js')),
    url(r'^socket.io/socket.io.js', socketio),
)

urlpatterns += staticfiles_urlpatterns()
init()