class Player {
    constructor(id, name, password, key){
        this.id = id;
        this.key = key;
        this.name = name;
        this.password = password;
        this.is_owner = false;
        this.is_online = true;
        this.has_voted = false;
        this.player_voted = '';
        this.role = {name: 'In attesa che la partita inizi', detail: ''};
        this.score = 0;
        this.increment = 0;
        this.bonus = 0;
        this.cheat_available = true;
        this.player_cheated = '';
    }

    joinRoom(room){
        var existing_player = room.player_list.find(x => x.name == this.name);

        if (existing_player == undefined){ //nuovo giocatore, inserire! && this.name.toLowerCase() != 'cielo'
            this.setOwnership(room);
            room.player_list.push(this);
            return 0;
        } else if (!existing_player.is_online) {//riconnesso, rimuovi e riaggiungi
            if (existing_player.password == this.password) {//check password
                room.player_list.splice(room.player_list.findIndex(x => x.name == this.name), 1);
                
                this.setOwnership(room);
                //prima prendo il vecchio ruolo e lo assegno di nuovo
                this.key = existing_player.key;
                this.role = existing_player.role;
                this.score = existing_player.score;
                this.increment = existing_player.increment;
                this.bonus = existing_player.bonus;
                this.has_voted = existing_player.has_voted;
                this.player_voted = existing_player.player_voted;
                this.cheat_available = existing_player.cheat_available;

                room.player_list.push(this);


                // //NUOVO                
                // existing_player.is_online = true;
                // //existing_player.id = this.id;
                // existing_player.setOwnership(room);

                // this.id = existing_player.id;
                // this.name = existing_player.name;
                // this.password = existing_player.password;
                // this.is_owner = existing_player.is_owner;
                // this.is_online = existing_player.is_online;
                // this.has_voted = existing_player.has_voted;
                // this.player_voted = existing_player.player_voted;
                // this.role = existing_player.role;
                // this.score = existing_player.score;
                // this.increment = existing_player.increment;
                // this.bonus = existing_player.bonus;
                // this.cheat_available = existing_player.cheat_available;
                // this.player_cheated = existing_player.player_cheated;

                return 1;
            } else {
                return -2; //password sbagliata! furbetto di merda scoppiato
            }
        } else {//nome già utilizzato!
            return -1;
        }
    }

    leaveRoom(room){
        this.is_online = false;

        if (this.is_owner){
            var new_owner = room.player_list.find(x => x.is_online);
            if (new_owner != undefined) {
                new_owner.setOwnership(room);
            }
        }
    }

    setOwnership(room){
        var current_owner = room.player_list.find(x => x.is_owner);

        if (current_owner == undefined){//owner inesistente
            this.is_owner = true;
        } else if (!current_owner.is_online){//owner inesistente MA offline
            this.is_owner = true;
            current_owner.is_owner = false;
        }//owner c'è ed è online, non faccio niente
    }
}

module.exports = Player;