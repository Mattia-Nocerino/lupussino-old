var socket_io = require('socket.io');
var Room = require('./classes/room.js');
var Player = require('./classes/player.js');
var io = socket_io();
var api = {};
api.io = io;

var room_list = [];
var room_list2 = [];

const configurazioni = [
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

io.on('connection', function(socket){
    console.log('A user connected: ' + socket.id);

    socket.on('disconnect', function(){
        var leaving_player;
        room_list.forEach((room, index) => {
            leaving_player = room.player_list.find(x => x.id == socket.id && x.is_online);
            if (leaving_player != undefined){
                leaving_player.leaveRoom(room);
                io.to(room.name).emit('update', {room: room});
            }
            console.log(room);
            socket.leave(room.name);
        });
    });

    socket.on('enter', function(data, callback){
        var new_room = room_list.find(x => x.name == data.room.name);
        var new_player = new Player(socket.id, data.player.name);
        var login_error = false;

        if (new_room == undefined){//creazione stanza
            new_room = new Room(data.room.name);
            room_list.push(new_room);
            new_player.is_owner = true;
        }

        if (new_player.joinRoom(new_room) == -1){
            login_error = true;
        } else {
            socket.join(new_room.name);
            io.to(new_room.name).emit('update', {room: room});
        }
        callback({login_error});
    });

//     socket.on('game', function(data, callback){
//         //carico la configurazione in base al numero di giocatori nella stanza
//         player_in_room = player_list.filter(c => c.room === data.room);
//         if (player_in_room.length >= 3) {
//             console.log(configurazioni);
//             configurazione_attiva = configurazioni[player_in_room.length].slice();
//             //assegno i ruoli
//             //loopo i giocatori e assegno il ruolo
//             for(var player of player_in_room){
//                 var random_item = Math.floor(Math.random() * configurazione_attiva.length);
//                 player.role = configurazione_attiva[random_item];
//                 configurazione_attiva.splice(random_item, 1);
//             }
//             var esiliate = configurazione_attiva;

//             for(var player of player_in_room){
//                 var altro_testimone = '';
//                 var altro_assassino = '';
//                 switch(player.role){
//                     case "cittadino":
//                         detail = "Sei un semplice cittadino in una città piena di assassini... guardati le spalle";
//                         break;
//                     case "investigatore":
//                         detail = "Hai veggiato nel mezzo: " + esiliate[Math.floor(Math.random() * esiliate.length)];
//                         break;
//                     case "investigatrice":
//                         detail = "Hai veggiato nel mezzo: " + esiliate[Math.floor(Math.random() * esiliate.length)];
//                         break;
//                     case "testimone":
//                         for(var t of player_in_room){
//                             if (t.role == 'testimone' && t.name != player.name){
//                                 altro_testimone = t.name;
//                             }
//                         }
                        
//                         if (altro_testimone == ''){
//                             detail = "Sei testimone... ma da solo";
//                         } else {
//                             if (player_in_room.length > 5){
//                                 detail = "Sei testimone con " + altro_testimone;
//                             } else {
//                                 detail = "Sei testimone e NON da solo!";
//                             }
//                         }
//                         break;
//                     case "mitomane":
//                         if (player_in_room.length > 5){
//                             detail = "Sei il mitomane e gli assassini sono ";
//                         } else {
//                             detail = "Mitomane, fatti votare (bastardo!)";
//                         }
//                         break;
//                     case "assassino":
//                         for(var a of player_in_room){
//                             if (a.role == 'assassino' && a.name != player.name){
//                                 altro_assassino = a.name;
//                             }
//                         }
                        
//                         if (altro_assassino == ''){
//                             detail = "Sei un'assassino... ma da solo";
//                         } else {
//                             detail = "Sei assassino con " + altro_assassino;
//                         }
//                         break;
//                 }
//                 io.to(`${player.id}`).emit('role', {role: player.role, detail: detail});
//             }

            
//             console.log(player_in_room);
//             // console.log(esiliate);
//             //rispondo ai client
//         }
//     });
});

module.exports = api;