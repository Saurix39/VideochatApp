'use strict';
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var os = require("os");
var socketIO = require("socket.io");
var http = require("http");
var app = require("./app");
var server = http.createServer(app);

mongoose.connect('mongodb://localhost:27017/videochat',{ useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log('La conexion a la base de datos se ha realizado correctamente');
    server.listen(process.env.PORT||8000, ()=>{
        console.log("El servidor esta corriendo por el puerto 8000")
    });
})
.catch(error=>console.log(error));


var io = socketIO(server);

io.on('connection',function(socket){
    console.log("Usuario conectado");
    socket.on('disconnect',()=>{
        socket.broadcast.in(socket.roomname).emit('user-disconnected', socket.username, socket.userpeerid);
    });

    socket.on('create-join-room',(room, nick, userpeerid)=>{
        socket.roomname = room;
        socket.username = nick;
        socket.userpeerid = userpeerid;
        socket.join(room);
        socket.broadcast.in(room).emit('new_user', nick, socket.id, userpeerid);
    });

    socket.on('user-existent',(id, nick, userpeerid)=>{
        socket.to(id).emit('user-existent',nick, userpeerid);
    });

    socket.on('message',(roomname,message)=>{
        socket.broadcast.in(roomname).emit('new_message',message);
    });
});

