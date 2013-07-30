from django.conf.urls import patterns, include, url
from django.contrib import admin
from Main.views import *
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:

    # url(r'^blog/', include('blog.urls')),
    url(r'^$', main),
    url(r'^about$', about),
    url(r'^repository$', repository),
    url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += staticfiles_urlpatterns()