class Player {
    constructor(name, id, room, is_owner = false){
        this.name = name;
        this.id = id;
        this.room = room;
        this.is_owner = is_owner;
    }
}

module.exports = Player;