var express = require("express");
var User = require("./models/user");
var Room = require("./models/room");
var validator = require("validator");
var bcrypt = require("bcrypt-nodejs");
var session = require("express-session");
var flash = require("connect-flash");
var crypto = require("crypto-js");
var app = express();
app.set('view engine', 'ejs');


app.use(flash());
app.use(express.static('public'));
app.use(session({
    resave:false,
    secret:'secretKey',
    saveUninitialized:false
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/',function(req,res){
    res.render("index.ejs",{error:0});
});

app.post('/verify',function(req,res){
    console.log("Se ha recibido información");
    var params = req.body;
    try{
        var validate_correo = validator.isEmail(params.correo) && !validator.isEmpty(params.correo);
        var validate_nick = !validator.isEmpty(params.nick);
        var valdiate_password = !validator.isEmpty(params.pass);
    } catch(ex){
        res.render("index.ejs",{error:1});
    }
    if(validate_correo && validate_nick && valdiate_password){
        User.findOne({'correo':params.correo},(error,user)=>{
            if(error){
                res.render("index.ejs",{error:1});
            }
            if(!user){
                bcrypt.hash(params.pass,null,null,(error,hash)=>{
                    if(error){
                        res.render("index.ejs",{error:1});
                    }
                    var usuario = {
                        correo: params.correo,
                        nick: params.nick,
                        password:hash
                    }
                    User.create(usuario,function(error){
                        if(error){
                            res.render("index.ejs",{error:1});
                        }else{
                            usuario.password=undefined;
                            req.session.user = usuario;
                            res.redirect("/rooms");
                        }
                    });
                });       
            }else{
                bcrypt.compare(params.pass, user.password,(error,check)=>{
                    if(error){
                        res.render("index.ejs",{error:1});
                    }
                    if(check){
                        user.password=undefined;
                        req.session.user = user;
                        res.redirect("/rooms");
                    }else{
                        res.render("index.ejs",{error:1});
                    }
                });
            }
        });
    }else{
        res.render("index.ejs",{error:1});
    }
});

app.get('/rooms',function(req,res){
    var error = req.flash('error');
    var error2 = req.flash('error2');
    var usuario = req.session.user;
    delete req.session.user;
    res.render("searchcreateroom.ejs",{user:usuario,error:error,error2:error2});
});

app.post('/create-room', function(req,res){
    var params = req.body;
    try{
        var validate_nombre = !validator.isEmpty(params.nombre);
        var validate_pass = !validator.isEmpty(params.pass);
    }catch(ex){
        req.flash('error',1);
        res.redirect('/rooms');
    }
    if(validate_nombre && validate_pass){
        Room.findOne({"name":params.nombre},(error,room)=>{
            if(error){
                req.flash('error',1);
                res.redirect('/rooms');
            }
            if(!room){
                bcrypt.hash(params.pass,null,null, (error,hashedpass)=>{
                    if(error){
                        req.flash('error',1);
                        res.redirect('/rooms');
                    }
                    if(hashedpass){
                        var hashname = crypto.MD5(params.nombre);
                        var newRoom = {
                            name: params.nombre,
                            hashedname:hashname+'',
                            password:hashedpass
                        }
                        Room.create(newRoom,(error)=>{
                            if(error){
                                req.flash('error',1);
                                res.redirect('/rooms');
                            }else{
                                newRoom.password = undefined;
                                req.flash('room',newRoom);
                                res.redirect('/room');
                            }
                        }) 
                    }
                });
                
            }else{
                req.flash('error',1);
                res.redirect('/rooms');
            }
        });
    }else{
        req.flash('error',1);
        res.redirect('/rooms');
    }
});

app.post('/join-room', function(req,res){
    var params = req.body;
    try{
        var validate_nombre = !validator.isEmpty(params.nombre);
        var validate_pass = !validator.isEmpty(params.pass);
    }catch(ex){
        req.flash('error2',1);
        res.redirect('/rooms');
    }
    if(validate_nombre && validate_pass){
        Room.findOne({"name":params.nombre},(error,room)=>{
            if(error){
                req.flash('error2',1);
                res.redirect('/rooms');
            }
            if(room){
                bcrypt.compare(params.pass,room.password,(error,check)=>{
                    if(error){
                        req.flash('error2',1);
                        res.redirect('/rooms');
                    }
                    if(check){
                        room.password=undefined;
                        req.flash('room',room);
                        res.redirect('/room');
                    }else{
                        req.flash('error2',1);
                        res.redirect('/rooms');
                    }
                });
            }else{
                req.flash('error2',1);
                res.redirect('/rooms');
            }
        });
    }else{
        req.flash('error2',1);
        res.redirect('/rooms');
    }
});

app.get('/room', function(req,res){
    var room = req.flash('room')[0];
    res.render('room.ejs',{room:room});
});

module.exports = app;