class Role {
    constructor(name, is_good){
        this.name = name;
        this.is_good = is_good;
    }
}

class Assassino extends Role {
    constructor(){
        super("assassino", false);
    }
}

module.exports = Role;