from django import template

register = template.Library()

@register.filter
def lookupfor(d, key) :
    return d[key-1]
