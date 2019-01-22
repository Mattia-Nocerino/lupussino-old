var socket_io = require('socket.io');
var Room = require('./classes/room.js');
var Player = require('./classes/player.js');
var io = socket_io();
var api = {};
api.io = io;

var room_list = [];

io.on('connection', function(socket){
    console.log('A user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('enter', function(room_name, player_name){
        //TODO: translate pseudocode
        var is_owner = false;
        var room;
        var player;

        if (!room_exists){
            room = new Room(room_name);
            room_list.push(room);
            is_owner = true;
        } else {
            //get room from room_list 
            room = room_list[];
        }
        
        if (!player_exists_in_room){
            var player = new Player(player_name, is_owner);
        } else {
            //giocatore già esistente!!! dio maialone
            return err;
        }

        //player entra finalmente nella stanza
        room.playerJoin(player);
        
        console.log(room_list);
        console.log(room.player_list);
        socket.join(room.name);
    });
});

module.exports = api;