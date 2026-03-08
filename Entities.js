class Turret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.crew = null; // Il personale assegnato
        this.level = 1;
    }
}
class Turret {
    // ... (costruttore esistente)
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 200;
        this.cooldown = 0; // Contatore per il ricaricamento
    }

    update(enemies, projectiles) {
        if (this.cooldown > 0) this.cooldown--;

        let closest = enemies.find(e => {
            let dist = Math.hypot(e.x - this.x, e.y - this.y);
            return dist < this.range;
        });

        if (closest && this.cooldown === 0) {
            projectiles.push(new Projectile(this.x, this.y, closest));
            this.cooldown = 60; // 60 frame di pausa
        }
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
class Turret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 150; // Raggio d'azione in pixel
        this.angle = 0;
    }

    update(enemies) {
        let closest = null;
        let minRange = this.range;

        // Trova il nemico più vicino nel raggio
        enemies.forEach(enemy => {
            let dx = enemy.x - this.x;
            let dy = enemy.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minRange) {
                minRange = dist;
                closest = enemy;
            }
        });

        // Se c'è un nemico, punta verso di lui
        if (closest) {
            this.angle = Math.atan2(closest.y - this.y, closest.x - this.x);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Disegna la base
        ctx.fillStyle = 'gray';
        ctx.fillRect(-10, -10, 20, 20);
        // Disegna la canna
        ctx.fillStyle = 'black';
        ctx.fillRect(0, -2, 20, 4);
        
        ctx.restore();
    }
}
