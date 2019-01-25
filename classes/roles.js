class Role {
    constructor(name, is_good){
        this.name = name;
        this.is_good = is_good;
    }
}

class Assassino extends Role {
    constructor(name){
        super(name, false);
    }
}

class Cittadino extends Role {
    constructor(name){
        super(name, true);
    }
}

class Detective extends Role {
    constructor(name){
        super(name, true);
    }
}

module.exports = {
    Assassino : Assassino,
    Cittadino : Cittadino,  
    Detective : Detective
}