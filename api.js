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

var configurazione_attiva = [];
var esiliate = [];

var room_list = [];
var key = 0;

io.on('connection', function(socket){
    //Invia la room list quando ti connetti
    socket.emit('room_list', {room_list: room_list});

    socket.on('disconnect', function(){
        var leaving_player;
        room_list.forEach((room, index) => {
            leaving_player = room.player_list.find(x => x.id == socket.id && x.is_online);
            console.log(leaving_player);
            if (leaving_player != undefined){
                if (!leaving_player.spectator){
                    leaving_player.leaveRoom(room);
                } else {
                    room.player_list = room.player_list.filter(x => x.name != leaving_player.name);
                    if (io.sockets.sockets[leaving_player.id] != undefined){
                        io.sockets.sockets[leaving_player.id].leave(room.name);
                    }
                }
                io.emit('room_list', {room_list: room_list});
                io.to(room.name).emit('room_update', {room: room});
            }
            // console.log(room_list);
            // console.log(room_list[0].player_list);
            // console.log(socket.rooms);
        });
    });

    socket.on('kick', function(room_name, kicked_player){
        var room = room_list.find(x => x.name == room_name);
        var player = room.player_list.find(x => x.name == kicked_player);
        var annulla_game = false;
        if (player != undefined){

            if (player.is_online && player.role.name != 'In attesa che la partita inizi') {//check se kickato un giocatore in gioco (stupido admin)
                annulla_game = true;
            }
            room.player_list = room.player_list.filter(x => x.name != kicked_player);

            if (room.player_list.length <= 2){//check se giocatori rimasti >= 3
                annulla_game = true;
            }

            if (annulla_game == true && room.game_started == true) {
                //in tali casi, game annullato, ripristina ruoli default
                room.game_started = false;
                room.player_list.forEach(player => {
                    player.role.name = 'In attesa che la partita inizi';
                    player.role.detail = '';
                    io.to(`${player.id}`).emit('role', player);
                });
            }

            io.to(room.name).emit('room_update', {room: room});
            if (io.sockets.sockets[player.id] != undefined){
                io.sockets.sockets[player.id].leave(room.name);
            }    
        }
    });

    socket.on('room_enter', function(data, callback){
        var new_room = room_list.find(x => x.name == data.room.name);
        key += 1;
        var new_player = new Player(socket.id, data.player.name, data.player.password, data.player.spectator, key);
        var player_name_already_in_use = false;
        var wrong_password = false;

        if (new_room == undefined){//creazione stanza
            new_room = new Room(data.room.name);
            room_list.push(new_room);
        }

        if (new_player.joinRoom(new_room) == -1){
            player_name_already_in_use = true;
            new_player.is_online = false;
        } else if (new_player.joinRoom(new_room) == -2) {
            wrong_password = true;
            new_player.is_online = false;
        } else {
            socket.join(new_room.name);
            io.to(new_room.name).emit('room_update', {room: new_room});
        }

        io.emit('room_list', {room_list: room_list});

        callback({
            player: new_player,
            errors: {
                player_name_already_in_use: player_name_already_in_use,
                wrong_password: wrong_password
            }
        });
        // console.log(room_list);
        // console.log(room_list[0].player_list);
        // console.log(socket.rooms);
    });

    socket.on('update_settings', function(data, callback){
        var room = room_list.find(x => x.name == data.room.name);
        room.mitomane_riconosce_assassini = data.room.mitomane_riconosce_assassini;
        room.testimoni_si_riconoscono = data.room.testimoni_si_riconoscono;
        //room.updateCittadiniDistinti(data.room.cittadini_distinti);
        io.to(room.name).emit('room_update', {room: room});
    });

    socket.on('update_cheat', function(data, callback){
        var room = room_list.find(x => x.name == data.room.name);
        var player = room.player_list.find(x => x.name == data.player.name);
        player.cheat_available = data.player.cheat_available;
        io.to(room.name).emit('room_update', {room: room});
    });

    socket.on('vote', function(data, callback){
        var room = room_list.find(x => x.name == data.room.name);
        var player = room.player_list.find(x => x.name == data.player.name);
        
        player.has_voted = data.player.has_voted;
        if(player.has_voted) {
            player.player_voted = data.player.player_voted;
        } else {
            player.player_voted = '';
        }

        if (room.player_list.filter(x => x.role.detail!='' && !x.spectator).length == room.player_list.filter(x => x.has_voted).length){
            room.game_started = false;
            room.vote_ended = true;
            //set has_voted = false to all
            // room.player_list.forEach(player => {
            //     player.has_voted = false;
            // });
        }

        io.to(room.name).emit('room_update', {room: room});

        if (room.game_started == false && room.vote_ended == true) {
            var bonus = false;
            var tot_voti_assassino = 0;
            var tot_non_voti_assassino = 0;

            var tot_voti_mitomane = 0;
            var tot_non_voti_mitomane = 0;
            var pv;
            
            var calcolo_assassini = true;
            var bonus_totale_assassini = true;
            var bonus_totale_mitomane = true;
            var bonus_totale_buoni = true;
            room.player_list.filter(x => x.role.detail!='' && !x.spectator).forEach(player => {
                console.log(player.name)
                if (player.role.name != 'Assassino' && player.role.name != 'Mitomane'){//Calcolo per buoni
                    if (player.player_voted == 'Cielo'){//Se voto al cielo controllo per assassini in gioco
                        if (room.player_list.filter(x => x.role.name == 'Assassino').length == 0){
                            bonus = true;
                        } else {
                            bonus = false;
                            bonus_totale_buoni = false;
                        }
                    } else {//Se il voto non è al cielo controllo il ruolo del giocatore votato
                        pv = room.player_list.find(x => x.name == player.player_voted);

                        if(pv.role.name == 'Assassino'){
                            bonus = true;
                        } else {
                            bonus = false;
                            bonus_totale_buoni = false;
                        }
                    }
                } else {//Se sei un cattivo conto in quanti ti hanno votato e in quanti invece no
                    if (player.role.name == 'Assassino' && calcolo_assassini){ //calcolo_assassini = booleano per fare il calcolo una sola volta e non ogni volta per ogni assassino!
                        calcolo_assassini = false;
                        room.player_list.filter(x => x.role.name != 'Assassino' && x.role.name != 'Mitomane' && !x.spectator).forEach(pp => {
                            if (pp.player_voted != 'Cielo') {
                                var player_voted = room.player_list.find(x => x.name == pp.player_voted);
                                if (player_voted.role.name == 'Assassino'){
                                    tot_voti_assassino++;
                                    bonus_totale_assassini = false;
                                } else {
                                    tot_non_voti_assassino++;
                                }
                            } else {
                                tot_non_voti_assassino++;
                            }
                        });
                        //console.log(player.name + " - " + player.role.name + " TOT_VOTI=" + tot_voti_assassino + " TOT_NON_VOTI=" + tot_non_voti_assassino);
                    }

                    if (player.role.name == 'Mitomane'){
                        tot_voti_mitomane     = room.player_list.filter(x => x.role.name != 'Assassino' && x.role.name != 'Mitomane' && !x.spectator).filter(y => y.player_voted == player.name).length;
                        tot_non_voti_mitomane = room.player_list.filter(x => x.role.name != 'Assassino' && x.role.name != 'Mitomane' && !x.spectator).filter(y => y.player_voted != player.name).length;

                        //console.log(player.name + " - " + player.role.name + " TOT_VOTI=" + tot_voti_mitomane + " TOT_NON_VOTI=" + tot_non_voti_mitomane);
                    }

                    if (tot_non_voti_mitomane > 0){
                        bonus_totale_mitomane = false;
                    }
                    
                }

                switch(player.role.name){
                    case "Cittadino":
                    case "Cittadina":
                        player.increment = (bonus ? +3 : -1);
                        break;
                    case "Testimone":
                        player.increment = (bonus ? +2 : -2);
                        break;
                    case "Investigatore":
                    case "Investigatrice":
                        player.increment = (bonus ? +2 : -3);
                        break;
                    case "Assassino":
                        player.increment = (tot_non_voti_assassino) - (tot_voti_assassino);
                        break;
                    case "Mitomane":
                        player.increment = (tot_voti_mitomane * 2) - (tot_non_voti_mitomane);
                        break;
                }
            });
            room.player_list.filter(x => x.role.detail!='' && !x.spectator).forEach(player => {//Assegnazione super bonus
                switch(player.role.name){
                    case "Cittadino":
                    case "Cittadina":
                        player.bonus = (bonus_totale_buoni ? +2 : 0);
                        break;
                    case "Testimone":
                        player.bonus = (bonus_totale_buoni ? +2 : 0);
                        break;
                    case "Investigatore":
                    case "Investigatrice":
                        player.bonus = (bonus_totale_buoni ? +1 : 0);
                        break;
                    case "Assassino":
                        player.bonus = (bonus_totale_assassini ? +2 : 0);
                        break;
                    case "Mitomane":
                        player.bonus = (bonus_totale_mitomane ? +2 : 0);
                        break;
                }

                player.score += player.increment + player.bonus;
            });

            io.to(room.name).emit('room_update', {room: room});

            // room.player_list.filter(x => x.role.detail!='' && !x.spectator).forEach(player => {
            //     //partita finita, resetto i ruoli
            //     player.role.name = 'In attesa che la partita inizi';
            //     player.role.detail = '';
            //     io.to(`${player.id}`).emit('role', player);
            // });

            io.to(room.name).emit('reveal_roles');
        }
    });

    
    socket.on('game', function(data, callback){
        //CARICAMENTO CONFIGURAZIONE
        var room = room_list.find(x => x.name == data.room.name);
        room.game_started = true;
        room.vote_ended = false;

        //rimozione utenti offline
        var players_offline = room.player_list.filter(x => !x.is_online).slice();
        players_offline.forEach(player => {
            room.player_list = room.player_list.filter(x => x.name != player.name);
            if (io.sockets.sockets[player.id] != undefined){
                io.sockets.sockets[player.id].leave(room.name);
            }
        });

        var players_online = room.player_list.filter(x => x.is_online && !x.spectator).slice();
        var tot_players = players_online.length;

        //room.updateCittadiniDistinti(room.cittadini_distinti);
        
        configurazione_attiva = room.configurazioni[tot_players].slice();

        if (tot_players == 2) { //Se giocatori sono due aggiungi solo o un lupo o un mitomane random
            var cattivi_temp = ["Assassino", "Mitomane"];
            configurazione_attiva.push(cattivi_temp[Math.floor(Math.random() * 2)]);
        }
        //ASSEGNAZIONE RUOLI + ESILIATE
        for(var player of players_online){
            var random_item = Math.floor(Math.random() * configurazione_attiva.length);
            player.role.name = configurazione_attiva[random_item];
            configurazione_attiva.splice(random_item, 1);
        }

        var esiliate = configurazione_attiva;
        var assassini = players_online.filter(x => x.role.name == 'Assassino').slice();

        // console.log(players_online);
        // console.log(assassini);

        players_online.forEach(player => {
            player.has_voted = false;
            player.cheat_available = true;
            player.player_voted = "";
            var altro_testimone = '';
            var altro_assassino = '';
            var tottestimoni =0;

            switch(player.role.name){
                case "Cittadino":
                case "Cittadina":
                    player.role.detail = "Sei un semplice cittadino in una città piena di assassini... guardati le spalle";
                    break;
                case "Investigatore":
                    player.role.detail = "Hai veggiato nel mezzo: " + esiliate[Math.floor(Math.random() * esiliate.length)];
                    break;
                case "Investigatrice":
                    player.role.detail = "Hai veggiato nel mezzo: " + esiliate[Math.floor(Math.random() * esiliate.length)];
                    break;
                case "Testimone":
                    for(var t of players_online){
                        if (t.role.name == 'Testimone' && t.name != player.name){
                            altro_testimone += t.name + " - ";
                            tottestimoni +=1;
                        }
                    }
                    
                    if (altro_testimone == ''){
                        player.role.detail = "Sei il testimone... ma da solo";
                    } else {
                        if (room.testimoni_si_riconoscono){
                            player.role.detail = "Sei testimone con " + altro_testimone.slice(0, -3);
                        } else {
                            if (tottestimoni > 1) {
                                player.role.detail = "Sei testimone insieme ad altri " + tottestimoni + " giocatori!";
                            } else {
                                player.role.detail = "Sei testimone insieme a qualcun altro!";
                            }
                        }
                    }
                    break;
                case "Mitomane":
                    if (room.mitomane_riconosce_assassini){
                        if (assassini.length == 3) player.role.detail = "Sei il mitomane e gli assassini sono " + assassini[0].name + ", "  + assassini[1].name + " e " + assassini[2].name;
                        if (assassini.length == 2) player.role.detail = "Sei il mitomane e gli assassini sono " + assassini[0].name + " e " + assassini[1].name;
                        if (assassini.length == 1) player.role.detail = "Sei il mitomane e l'assassino è " + assassini[0].name;
                        if (assassini.length == 0) player.role.detail = "Sei il mitomane e non ci sono assassini in giro ad aiutarti";
                    } else {
                        player.role.detail = "Mitomane, fatti votare (bastardo!)";
                    }
                    break;
                case "Assassino":
                    for(var a of players_online){
                        if (a.role.name == 'Assassino' && a.name != player.name){
                            altro_assassino += a.name + " - ";
                        }
                    }
                    
                    if (altro_assassino == ''){
                        player.role.detail = "Sei un'assassino";
                    } else {
                        player.role.detail = "Sei assassino con " + altro_assassino.slice(0, -3);
                    }
                    break;
            }
            io.to(`${player.id}`).emit('role', player);
            //console.log(player.name + " - " + player.role.name);
        });
        io.to(room.name).emit('room_update', {room: room});
    });
});

module.exports = api;