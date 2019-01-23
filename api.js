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
var player_in_room = [];

var configurazioni = [
    null, //0
    null, //1
    null, //2
    ["cittadino", "testimone", "testimone", "assassino", "mitomane", "investigatore"], //3
    ["cittadino", "testimone", "testimone", "assassino", "mitomane", "investigatore", "investigatrice"], //4
    ["cittadino", "testimone", "testimone", "assassino", "assassino", "mitomane", "investigatore", "investigatrice"], //5
    ["cittadino", "cittadino", "testimone", "testimone", "assassino", "assassino", "mitomane", "investigatore", "investigatrice"], //6
    null, //7
    null, //8
    null, //9
    null  //10
];
var configurazione_attiva = [];

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
                callback(true, {is_owner: false});
                return;
            }
        }

        player_list.push(player);
        room.playerJoin(player);
        socket.join(room.name);
        callback(false, {is_owner: player.is_owner});
    });

    socket.on('game', function(data, callback){
        //carico la configurazione in base al numero di giocatori nella stanza
        player_in_room = player_list.filter(c => c.room === data.room);
        configurazione_attiva = configurazioni[player_in_room.length];
        //assegno i ruoli
        
        
        //rispondo ai client
    });
});

module.exports = api;