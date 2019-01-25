class Room {
    constructor(name){
        this.name = name;
        this.player_list = [];
    }

    get player_number() {
        return this.player_list.length;
    }

    get owner() {
        return this.player_list.find(o => o.is_owner == true);
    }

    playerJoin(player) {
        if (this.player_list.find(p => p.name == player.name != undefined)){
            this.player_list.push(player);
            return;
        } else {
            return -1;
        }
    }
}

module.exports = Room;