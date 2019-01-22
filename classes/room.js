class Room {
    constructor(name, owner){
        this.name = name;
        this.player_list = [];
    }

    playerJoin(player){
        this.player_list.push(player);
    }

    playerLeave(player){
        this.player_list.push(player)
    }
}

module.exports = Room;