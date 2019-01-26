class Player {
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.is_owner = false;
        this.is_online = true;
        this.role = '';
    }

    joinRoom(room){
        var existing_player = room.player_list.find(x => x.name == this.name);
        if (existing_player == undefined){ //nuovo giocatore, inserire!
            if (room.player_list.find(x => x.is_owner) == undefined) this.is_owner = true; //controllo se non ci sono owner al momento
            room.player_list.push(this);
            return 0;
        } else if (!existing_player.is_online) {//riconnesso, rimuovi e riaggiungi
            room.player_list.splice(room.player_list.findIndex(x => x.name == this.name), 1);
            if (room.player_list.find(x => x.is_owner) == undefined) this.is_owner = true; //controllo se non ci sono owner al momento
            room.player_list.push(this);
            return 1;
        } else {//nome già utilizzato!
            return -1;
        }
    }

    leaveRoom(room){
        this.is_online = false;
        var another_user = room.player_list.find(x => x.is_online);

        if (another_user != undefined) {//c'è un'altro giocatore, mantieni la stanza ed eventualmente trasferisci l'ownership
            if (this.is_owner){
                this.is_owner = false;
                another_user.is_owner = true;
            }
            return 1;
        } else {//stanza da eliminare! (no idiota, perché se escono tutti sei ner bottino!)
            this.is_owner = false;
            return -1
        }
    }
}

module.exports = Player;