class Player {
    constructor(id, name, password){
        this.id = id;
        this.name = name;
        this.password = password;
        this.is_owner = false;
        this.is_online = true;
        this.has_voted = false;
        this.player_voted = '';
        this.role = {name: 'In attesa che la partita inizi', detail: ''};
        this.score = 0;
    }

    joinRoom(room){
        var existing_player = room.player_list.find(x => x.name == this.name);

        if (existing_player == undefined && this.name.toLowerCase() != 'cielo'){ //nuovo giocatore, inserire!
            this.setOwnership(room);
            room.player_list.push(this);
            return 0;
        } else if (!existing_player.is_online) {//riconnesso, rimuovi e riaggiungi
            if (existing_player.password == this.password) {//check password
                this.setOwnership(room);
                //prima prendo il vecchio ruolo e lo assegno di nuovo
                this.role = existing_player.role;
                this.score = existing_player.score;
                this.has_voted = existing_player.has_voted;
                this.player_voted = existing_player.player_voted;

                room.player_list.splice(room.player_list.findIndex(x => x.name == this.name), 1);
                room.player_list.push(this);
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