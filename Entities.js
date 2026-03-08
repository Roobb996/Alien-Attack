class Turret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.crew = null; // Il personale assegnato
        this.level = 1;
    }
}

class Crew {
    constructor() {
        this.xp = 0;
        this.efficiency = 1.0;
    }
    gainXP(amount) {
        this.xp += amount;
        // Logica per aumento efficienza
    }
}
