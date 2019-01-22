class Player {
    constructor(name, is_owner = false){
        this.name = name;
        this.is_owner = is_owner;
        this.role = '';
    }
}

module.exports = Player;