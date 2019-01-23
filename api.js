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

    socket.on('enter', function(room_name, player_name){        
        room = room_list.find(r => r.name == room_name);

        if (room == undefined){
            console.log("Creo la stanza");
            room = new Room(room_name);
            room_list.push(room);
            player = new Player(player_name, socket.id, room_name, true);
        } else {
            console.log("Mi unisco alla stanza");
            player = room.player_list.find(p => p.name == player_name);
            if (player == undefined){
                player = new Player(player_name, socket.id, room_name, false);
            } else {
                console.log("Giocatore già presente nella stanza");
                socket.emit('enter_error', {enter_error: true});
                return;
            }
        }

        player_list.push(player);
        room.playerJoin(player);
        socket.join(room.name);

        console.log(room_list);
        console.log(player_list);
        // room.playerJoin(player);
        // socket.join(room.name);
    });
});

module.exports = api;