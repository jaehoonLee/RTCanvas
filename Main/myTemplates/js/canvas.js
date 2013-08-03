var myColor = '#000000';
var myWidth = 1;

$(document).ready(function () {
        function Point(event, target) {
            this.x = event.pageX - $(target).position().left;
            this.y = event.pageY - $(target).position().top;
        }

        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var isDown = false;

        var newPoint, oldPoint, myNewPoint, myOldPoint;
        var oldPointDatas = null;
        var oldPointData = null;
        var drawId = null;
        var authorId = null;

        var widthRatio = 10 / 8.0;
        var heightRatio = 10 / 8.0;
        var canvas_width = 1000;
        var canvas_height = 1000;

        var line_cap = "round"

        //Draw Background Image
        var background = new Image();
        background.src = "http://127.0.0.1:8000/static/img/sketchbook.jpg";
        background.onload = function () {
            context.drawImage(background, 0, 0, canvas_width, canvas_height);
        };

        var socket = io.connect("http://jhun88.cafe24.com:3000/");
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
                        context.lineCap = line_cap;
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
                    context.lineCap = line_cap;
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
//                console.log("oldPoint:" + oldPoint + ":" + oldPointData.id + ":" + data.id);
                if (oldPoint != null && oldPointData.id == data.id) {
                    var x = data.points[0].x;
                    var y = data.points[0].y;

                    context.lineWidth = data.strokeWidth;
                    context.strokeStyle = data.strokeColor;
                    context.beginPath();
                    context.moveTo(oldPoint.x, oldPoint.y);
                    context.lineTo(x, y);
                    context.lineCap = line_cap;
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
                context.moveTo(oldPoint.x, oldPoint.y);
                context.lineTo(x, y);
                context.lineCap = line_cap;
                context.stroke();
                oldPoint = data.points[i];
            }
            oldPointData = data;
        });

        socket.on('clear', function (data) {
            context.clearRect(0, 0, canvas_width, canvas_height);
            context.drawImage(background, 0, 0, canvas_width, canvas_height);
        });


        $('#canvas').mousedown(function (event) {
                drawId = parseInt(Math.random() * Math.pow(10, 10));
                authorId = parseInt(Math.random() * Math.pow(10, 10));
                isDown = true;

                myOldPoint = new Point(event, this);
            }
        ).mouseup(function () {
                isDown = false;
            }
        ).mousemove(function (event) {
                if (isDown) {
                    myNewPoint = new Point(event, this);

                    console.log('myNewPoint:' + myNewPoint.x + " " + myNewPoint.y);
                    context.beginPath();
                    context.lineWidth = myWidth;
                    context.strokeStyle = myColor;
                    context.moveTo(myOldPoint.x * widthRatio, myOldPoint.y * heightRatio);
                    context.lineTo(myNewPoint.x * widthRatio, myNewPoint.y * heightRatio);
                    context.lineCap = line_cap;
                    context.stroke();
                    context.fill();

                    socket.emit('senddata', {
                        strokeWidth: myWidth,
                        strokeColor: myColor,
                        fillColor: myColor,
                        authorName: 'jh',
                        authorId: '0',
                        id: drawId,
                        isFill: false,
                        isErase: false,
                        points: [
                            {x: myOldPoint.x * widthRatio, y: myOldPoint.y * heightRatio },
                            {x: myNewPoint.x * widthRatio, y: myNewPoint.y * heightRatio }
                        ]
                    });
                    myOldPoint = myNewPoint
                }


            }
        ).mouseout(function (event) {
                isDown = false
            });

        $('.clearBtn').click(function () {
            socket.emit('clear');
        });

        $('#colorpicker').farbtastic(function (data) {
            myColor = data;
        });
    }
)


function showValue(newValue) {
    myWidth = newValue;
    document.getElementById("range").innerHTML = newValue;
}

function refreshPage(partiID, csrf_token) {
    var id = 1;
//    var csrftoken = getCookie('csrftoken');
    var data = ' { \'id\' : \'' + id + '\', \'partiID\' : \'' + partiID + '\' }'; //, csrfmiddlewaretoken : '+ csrftoken + ' }';
//    var data = ' { \'id\' : \'' + id + '\', \'partiID\' : \'' + partiID + '\', csrfmiddlewaretoken : \''+ csrf_token + '\' }';

    $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:8000/get_participant/',
        data: {
            'id': id,
            'partiID': partiID
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
            }
        }
    }).always(function () {
        });
}

$(document).ajaxSend(function (event, xhr, settings) {
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