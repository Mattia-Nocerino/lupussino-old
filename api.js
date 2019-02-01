var socket_io = require('socket.io');
var Room = require('./classes/room.js');
var Player = require('./classes/player.js');
//var Roles = require('./classes/roles.js');
var io = socket_io();
var api = {};
api.io = io;

// const configuration = [
//     {players: 3, cards: [
//         {role: new Roles.Cittadino(), qty: 1}, 
//         {role: new Roles.Testimone(), qty: 2}, 
//         {role: new Roles.Assassino(), qty: 1}, 
//         {role: new Roles.Detective(1), qty: 1},
//         {role: new Roles.Mitomane(), qty: 1}
//     ]},
//     {players: 4, cards: [
//         {role: new Roles.Cittadino(), qty: 1}, 
//         {role: new Roles.Testimone(), qty: 2}, 
//         {role: new Roles.Assassino(), qty: 1}, 
//         {role: new Roles.Detective(1), qty: 1},
//         {role: new Roles.Detective(2), qty: 1},
//         {role: new Roles.Mitomane(), qty: 1}
//     ]},
//     {players: 5, cards: [
//         {role: new Roles.Cittadino(), qty: 1}, 
//         {role: new Roles.Testimone(), qty: 2}, 
//         {role: new Roles.Assassino(), qty: 2}, 
//         {role: new Roles.Detective(1), qty: 1},
//         {role: new Roles.Detective(2), qty: 1},
//         {role: new Roles.Mitomane(), qty: 1}
//     ]},
//     {players: 6, cards: [
//         {role: new Roles.Cittadino(), qty: 2}, 
//         {role: new Roles.Testimone(), qty: 2}, 
//         {role: new Roles.Assassino(), qty: 2}, 
//         {role: new Roles.Detective(1), qty: 1},
//         {role: new Roles.Detective(2), qty: 1},
//         {role: new Roles.Mitomane(), qty: 1}
//     ]}
// ];

const configurazioni = [
    null, //0
    null, //1
    null, //2
    ["Cittadino", "Testimone", "Testimone", "Assassino", "Mitomane", "Investigatore"], //3
    ["Cittadino", "Testimone", "Testimone", "Assassino", "Mitomane", "Investigatore", "Investigatrice"], //4
    ["Cittadino", "Testimone", "Testimone", "Assassino", "Assassino", "Mitomane", "Investigatore", "Investigatrice"], //5
    ["Cittadino", "Cittadino", "Testimone", "Testimone", "Assassino", "Assassino", "Mitomane", "Investigatore", "Investigatrice"], //6
    null, //7
    null, //8
    null, //9
    null  //10
];
var configurazione_attiva = [];
var esiliate = [];

var room_list = [];

io.on('connection', function(socket){
    //Invia la room list quando ti connetti
    socket.emit('room_list', {room_list: room_list});

    socket.on('disconnect', function(){
        var leaving_player;
        room_list.forEach((room, index) => {
            leaving_player = room.player_list.find(x => x.id == socket.id && x.is_online);
            if (leaving_player != undefined){
                leaving_player.leaveRoom(room);
                io.to(room.name).emit('room_update', {room: room});
                io.emit('room_list', {room_list: room_list});
            }
            // console.log(room_list);
            // console.log(room_list[0].player_list);
            // console.log(socket.rooms);
        });
    });

    socket.on('kick', function(room_name, kicked_player){
        var room = room_list.find(x => x.name == room_name);
        var player = room.player_list.find(x => x.name == kicked_player);
        if (player != undefined){
            room.player_list = room.player_list.filter(x => x.name != kicked_player);
            io.to(room.name).emit('room_update', {room: room});
            
            io.sockets.sockets[player.id].leave(room.name);
        }
    });

    socket.on('room_enter', function(data, callback){
        var new_room = room_list.find(x => x.name == data.room.name);
        var new_player = new Player(socket.id, data.player.name);
        var player_name_already_in_use = false;

        if (new_room == undefined){//creazione stanza
            new_room = new Room(data.room.name);
            room_list.push(new_room);
            new_player.is_owner = true;
        }

        if (new_player.joinRoom(new_room) == -1){
            player_name_already_in_use = true;
            new_player.is_online = false;
        } else {
            socket.join(new_room.name);
            io.to(new_room.name).emit('room_update', {room: new_room});
        }

        io.emit('room_list', {room_list: room_list});

        callback({
            player: new_player,
            errors: {
                player_name_already_in_use: player_name_already_in_use
            }
        });
        // console.log(room_list);
        // console.log(room_list[0].player_list);
        // console.log(socket.rooms);
    });

    //NUOVA FUNZIONE (DA CONTINUARE)
    // socket.on('new_game', function(data){
    //     var room = room_list.find(x => x.name == data.room.name);
    //     var invalid_player_number = false;

    //     room.cards = configuration.find(x => x.players == room.player_number).cards;

    //     if (room.cards == undefined) {
    //         invalid_player_number = true;
    //     } else {
    //         room.gameStart();
    //     }

    //     io.to(room.name).emit('update', {
    //         room: room
    //         // ,
    //         // errors: {
    //         //     invalid_player_number: invalid_player_number
    //         // }
    //     });
    // })


    //VECCHIA MERDA CASINO BLEAAAAH
    socket.on('game', function(data, callback){
        //CARICAMENTO CONFIGURAZIONE
        var room = room_list.find(x => x.name == data.room.name);
        var players_online = room.player_list.filter(x => x.is_online).slice();
        var tot_players = players_online.length;
        if (tot_players >= 3) {
            configurazione_attiva = configurazioni[tot_players].slice();
            //ASSEGNAZIONE RUOLI + ESILIATE
            for(var player of players_online){
                var random_item = Math.floor(Math.random() * configurazione_attiva.length);
                player.role = configurazione_attiva[random_item];
                configurazione_attiva.splice(random_item, 1);
            }
            var esiliate = configurazione_attiva;
            var assassini = players_online.filter(x => x.role == 'Assassino').slice();

            // console.log(players_online);
            // console.log(assassini);

            players_online.forEach(player => {
                var altro_testimone = '';
                var altro_assassino = '';

                switch(player.role){
                    case "Cittadino":
                        detail = "Sei un semplice cittadino in una città piena di assassini... guardati le spalle";
                        break;
                    case "Investigatore":
                        detail = "Hai veggiato nel mezzo: " + esiliate[Math.floor(Math.random() * esiliate.length)];
                        break;
                    case "Investigatrice":
                        detail = "Hai veggiato nel mezzo: " + esiliate[Math.floor(Math.random() * esiliate.length)];
                        break;
                    case "Testimone":
                        for(var t of players_online){
                            if (t.role == 'Testimone' && t.name != player.name){
                                altro_testimone = t.name;
                            }
                        }
                        
                        if (altro_testimone == ''){
                            detail = "Sei il testimone... ma da solo";
                        } else {
                            if (tot_players > 5){
                                detail = "Sei testimone con " + altro_testimone;
                            } else {
                                detail = "Sei testimone insieme a qualcun altro!";
                            }
                        }
                        break;
                    case "Mitomane":
                        if (tot_players > 5){
                            if (assassini.length == 2) detail = "Sei il mitomane e gli assassini sono " + assassini[0].name + " e " + assassini[1].name;
                            if (assassini.length == 1) detail = "Sei il mitomane e l'assassino è " + assassini[0].name;
                            if (assassini.length == 0) detail = "Sei il mitomane e non ci sono assassini in giro ad aiutarti";
                        } else {
                            detail = "Mitomane, fatti votare (bastardo!)";
                        }
                        break;
                    case "Assassino":
                        for(var a of players_online){
                            if (a.role == 'Assassino' && a.name != player.name){
                                altro_assassino = a.name;
                            }
                        }
                        
                        if (altro_assassino == ''){
                            if (tot_players > 5){
                                detail = "Sei un'assassino... ma da solo";
                            }else{
                                detail = "Sei un'assassino";
                            }
                        } else {
                            detail = "Sei assassino con " + altro_assassino;
                        }
                        break;
                }
                io.to(`${player.id}`).emit('role', {role: player.role, detail: detail});
            });
            // console.log(esiliate);
            //rispondo ai client
        }
    });
});

module.exports = api;