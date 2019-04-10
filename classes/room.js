var Roles = require('./roles.js');

class Room {
    constructor(name){
        this.name = name;
        this.player_list = [];
        this.mitomane_riconosce_assassini = false;
        this.testimoni_si_riconoscono = false;
        //this.cards = [];
    }

    get player_number() {
        return this.player_list.filter(x => x.is_online).length
    }

    get owner() {
        return this.player_list.find(x => x.is_owner == true);
    }

    // assignRoles() {

    // }

    // gameStart() {
    //     this.assignRoles();
    // }
}

module.exports = Room;

