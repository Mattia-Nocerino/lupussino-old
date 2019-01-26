class Role {
    constructor(name, is_good){
        this.name = name;
        this.is_good = is_good;
    }
}

class Cittadino extends Role {
    constructor(name = "Cittadino"){
        super(name, true);
    }
}

class Testimone extends Role {
    constructor(name = "Testimone"){
        super(name, true);
    }
}

class Detective extends Role {
    constructor(type){
        switch(type){
            case 1: super("Investigatore", true);
                break;
            case 2: super("Investigatrice", true);
                break;
        }
    }
}

class Assassino extends Role {
    constructor(name = "Assassino"){
        super(name, false);
    }
}

class Mitomane extends Role {
    constructor(name = "Mitomane"){
        super(name, false);
    }
}


module.exports = {
    Cittadino : Cittadino,  
    Testimone : Testimone,
    Detective : Detective,
    Assassino : Assassino,
    Mitomane : Mitomane,
}