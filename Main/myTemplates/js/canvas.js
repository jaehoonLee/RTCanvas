var color = '#000000';
var width = 1;

$(document).ready(function () {
        function Point(event, target) {
            this.x = event.pageX - $(target).position().left;
            this.y = event.pageY - $(target).position().top;
        }

        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var isDown = false;

        var newPoint, oldPoint;
        var oldPointDatas = null;
        var oldPointData = null;
        var drawId = null;
        var authorId = null;
        var widthRatio = 1;
        var heightRatio = 1;

        //Draw Background Image
        var background = new Image();
        background.src = "http://127.0.0.1:8000/static/img/sketchbook.jpg";
        background.onload = function () {
            context.drawImage(background, 0, 0, 700, 700);
        };

//        var socket = io.connect("http://127.0.0.1:3000/");
        var socket = io.connect("http://jhun88.cafe24.com:3000/") ;
        socket.on('connect', function () {
            console.log("connected2");
        });

        socket.on('canvasSync', function (data) {
            for (var i = 0; i < data.pointArr.length; i++) {
                var pointDatas = data.pointArr[i];
                if (pointDatas.points.length != 0) {
                    if (oldPoint != null && oldPointDatas.id == pointDatas.id) {
                        var x = pointDatas.points[0].x;
                        var y = pointDatas.points[0].y;

                        context.lineWidth = pointDatas.strokeWidth;
                        context.strokeStyle = pointDatas.strokeColor;
                        context.beginPath();
                        context.moveTo(oldPoint.x * widthRatio, oldPoint.y * heightRatio);
                        context.lineTo(x * widthRatio, y * heightRatio);
                        context.stroke();
                    }
                }
                oldPoint = pointDatas.points[0];
                for (var j = 1; j < pointDatas.points.length; j++) {
                    var x = pointDatas.points[j].x;
                    var y = pointDatas.points[j].y;

                    context.lineWidth = pointDatas.strokeWidth;
                    context.strokeStyle = pointDatas.strokeColor;
                    context.beginPath();
                    context.moveTo(oldPoint.x * widthRatio, oldPoint.y * heightRatio);
                    context.lineTo(x * widthRatio, y * heightRatio);
                    context.stroke();
                    oldPoint = pointDatas.points[j];
                }
                oldPointDatas = pointDatas;
            }

        });

        socket.on('draw', function (data) {
            context.lineWidth = data.width;
            context.strokeStyle = data.color;
            context.beginPath();
            context.moveTo(data.x1, data.y1);
            context.lineTo(data.x2, data.y2);
            context.stroke();
        });

        socket.on('senddata', function (data) {


            if (data.points.length != 0 && oldPointData != null) {
//                console.log("oldPoint:" + oldPointData.id+ ":" + data.id)  ;
                console.log("oldPoint:" + oldPoint + ":" + oldPointData.id + ":" + data.id);
                if (oldPoint != null && oldPointData.id == data.id) {
                    console.log("oldPoint");
                    var x = data.points[0].x;
                    var y = data.points[0].y;

                    context.lineWidth = data.strokeWidth;
                    context.strokeStyle = data.strokeColor;
                    context.beginPath();
                    context.moveTo(oldPoint.x * widthRatio, oldPoint.y * heightRatio);
                    context.lineTo(x * widthRatio, y * heightRatio);
                    context.stroke();
                }
            }

            oldPoint = data.points[0];
            for (var i = 1; i < data.points.length; i++) {
                var x = data.points[i].x;
                var y = data.points[i].y;

                context.lineWidth = data.strokeWidth;
                context.strokeStyle = data.strokeColor;
                context.beginPath();
                context.moveTo(oldPoint.x * widthRatio, oldPoint.y * heightRatio);
                context.lineTo(x * widthRatio, y * heightRatio);
                context.stroke();
                oldPoint = data.points[i];
            }
            oldPointData = data;
        });

        socket.on('clear', function (data) {
            context.clearRect(0, 0, 2000, 2000);
            context.drawImage(background, 0, 0, 700, 700);
        });


        $('#canvas').mousedown(function (event) {
                drawId = parseInt(Math.random() * Math.pow(10, 10));
                authorId = parseInt(Math.random() * Math.pow(10, 10));
                console.log(drawId);
                isDown = true;

                oldPoint = new Point(event, this);

                context.lineWidth = width;
                context.strokeStyle = color;
            }
        ).mouseup(function () {
                console.log("mouseup");
                isDown = false;
            }
        ).mousemove(function (event) {
                if (isDown) {

                    newPoint = new Point(event, this);
                    context.beginPath();
                    context.moveTo(oldPoint.x * widthRatio, oldPoint.y * heightRatio);
                    context.lineTo(newPoint.x * widthRatio, newPoint.y * heightRatio);
                    context.stroke();
//                socket.emit('draw',
//                    {
//                       width : width,
//                       color : color,
//                       x1 : oldPoint.x,
//                       y1 : oldPoint.y,
//                       x2 : newPoint.x,
//                       y2 : newPoint.y
//                    });

                    socket.emit('senddata', {
                        strokeWidth: width,
                        strokeColor: color,
                        fillColor: color,
                        authorName: 'jh',
                        authorId: '0',
                        id: drawId,
                        isFill: false,
                        isErase: false,
                        points: [
                            {x: oldPoint.x, y: oldPoint.y},
                            {x: newPoint.x, y: newPoint.y}
                        ]
                    });
//                console.log("mouse move (" + oldPoint.x + "," + oldPoint.y + "), (" + newPoint.x + ", " + newPoint.y + ")");
                    oldPoint = newPoint
                }
            }
        );


        $('.clearBtn').click(function () {
            socket.emit('clear');
        });

        $('#colorpicker').farbtastic(function (data) {
            color = data;
            console.log(data);
        });

    }
)

$(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

function showValue(newValue) {
    width = newValue;
    document.getElementById("range").innerHTML = newValue;
}

function refreshPage(partiID, csrf_token) {
    var id = 1;
//    var csrftoken = getCookie('csrftoken');
    var data = ' { \'id\' : \'' + id + '\', \'partiID\' : \'' + partiID + '\' }'    ; //, csrfmiddlewaretoken : '+ csrftoken + ' }';
//    var data = ' { \'id\' : \'' + id + '\', \'partiID\' : \'' + partiID + '\', csrfmiddlewaretoken : \''+ csrf_token + '\' }';

    console.log(data);
    $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:8000/get_participant/',
        data: {
            'id' : id,
            'partiID' : partiID
        },
        success: function (msg) {
            $('.member').empty();
            $('.member').append("<span style=\"color:#a47e3c; font-weight:bold;\">입장한 사람들<br></span>");
            var member = JSON.parse(msg);
            for (var i = 0; i < member.length; i++) {
                if (i % 2 == 0) {
                    $('.member').append("<img src=\"/static/img/thumb.jpg\" style=\"width:20px; height:20px;margin-right: 10px;\">"
                        + member[i] + "<br>");
                } else {
                    $('.member').append("<img src=\"/static/img/thumb2.jpg\" style=\"width:20px; height:20px;margin-right: 10px;\">"
                        + member[i] + "<br>");
                }

                console.log(member[i]);
            }
        }
    }).always(function () {
        });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
