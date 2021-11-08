var socket = io();
var user = JSON.parse(localStorage.getItem('user'));
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const peers = {};

socket.roomname = room.hashedname;
socket.username = user.nick;
myVideo.muted = true;
room = undefined;

const myPeer = new Peer(undefined,{
    host: '/',
    port: '3001'
});

myPeer.on('open', id => {
    socket.userpeerid = id;
    socket.emit('create-join-room', socket.roomname, user.nick, socket.userpeerid);
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
.then(stream => {
    addVideoStream(myVideo,stream);
    socket.on('new_user',(othernick, otherid ,otheruserpeerid)=>{
        $('#messages').append("<p><b>El usuario "+othernick+" ha ingresado a la sala</b></p>");
        connectWithNewUser(otheruserpeerid, stream);
        socket.emit("user-existent",otherid, user.nick, socket.userpeerid);
    });

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video'); 
        call.on('stream', userVideoStream=>{
            addVideoStream(video, userVideoStream);
        });
    });

});

function connectWithNewUser(otheruserpeerid, stream){
    const call = myPeer.call(otheruserpeerid, stream);
    peers[otheruserpeerid] = call;
    const video = document.createElement('video');
    call.on('stream', userstream => {
        addVideoStream(video,userstream);
    });
    call.on('close', () => {
        video.remove();
    });
}

function endScroll(){
    var div = document.getElementById('messages');
    div.scrollTop = '9999';
}

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

socket.on("user-existent",(nick, userpeerid)=>{
    console.log("Existe este usuario "+nick);
});

socket.on('new_message',(message)=>{
    $('#messages').append(message);
});

socket.on('user-disconnected', (nick, userpeerid) => {
    $('#messages').append("<p><b>El usuario "+nick+" ha abandonado la sala</b></p>");
    if(peers[userpeerid]) peers[userpeerid].close()
});

$('#formulario').submit(function(e){
    e.preventDefault();
    $('#messages').append('<p><b>'+socket.username+':</b> '+$('#msg').val()+'</p>');
    socket.emit('message',socket.roomname,'<p><b>'+socket.username+':</b> '+$('#msg').val()+'</p>');
    document.getElementById('formulario').reset();
    endScroll();
});