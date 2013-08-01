/**
 * Created with PyCharm.
 * User: user
 * Date: 13. 7. 31
 * Time: 오전 2:30
 * To change this template use File | Settings | File Templates.
 */
function enterRoom()
{
//    document.location = '/canvas';
    $('#makeRoom').modal('show');
}

function createRoom()
{
    console.log("a");
    document.makeRoom.submit();
}

function enterParticipant(name, id)
{
    $('#roomName').text(name);
    $('#roomID').val(id);
    $('#participant').modal('show');
}