class Player {
    constructor(id, name, room, is_owner = false){
        this.id = id;
        this.name = name;
        this.is_owner = is_owner;
        this.is_online = false;
        this.role = '';
    }
}

module.exports = Player;