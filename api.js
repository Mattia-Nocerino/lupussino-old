var socket_io = require('socket.io');
var Room = require('./classes/room.js');
var Player = require('./classes/player.js');
var io = socket_io();
var api = {};
api.io = io;

var room_list = [];
var player_list = [];
var room;
var player;

io.on('connection', function(socket){
    console.log('A user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('enter', function(data, callback){        
        room = room_list.find(r => r.name == data.room);

        if (room == undefined){
            console.log("Creo la stanza");
            room = new Room(data.room);
            room_list.push(room);
            player = new Player(data.player, socket.id, data.room, true);
        } else {
            console.log("Mi unisco alla stanza");
            player = room.player_list.find(p => p.name == data.player);
            if (player == undefined){
                player = new Player(data.player, socket.id, data.room, false);
            } else {
                console.log("Giocatore già presente nella stanza");
                callback(true);
                return;
            }
        }

        player_list.push(player);
        room.playerJoin(player);
        socket.join(room.name);
        callback(false);
    });
});

module.exports = api;