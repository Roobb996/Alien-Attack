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
// Aggiungi in entities.js
const path = [
    {x: 0, y: 150},
    {x: 200, y: 150},
    {x: 200, y: 350},
    {x: 600, y: 350}
];

class Enemy {
    constructor() {
        this.x = path[0].x;
        this.y = path[0].y;
        this.targetIndex = 1;
        this.speed = 2;
        this.health = 100;
    }

    update() {
        let target = path[this.targetIndex];
        let dx = target.x - this.x;
        let dy = target.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.targetIndex++;
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    }
}
