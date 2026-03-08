// Percorso per i nemici
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
        this.range = 200;
        this.cooldown = 0;
        this.angle = 0;
        this.crew = null; // Riservato per il futuro
        this.level = 1;
    }

    update(enemies, projectiles) {
        if (this.cooldown > 0) this.cooldown--;

        // 1. Mira e punta
        let closest = null;
        let minRange = this.range;
        enemies.forEach(enemy => {
            let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < minRange) {
                minRange = dist;
                closest = enemy;
            }
        });

        if (closest) {
            this.angle = Math.atan2(closest.y - this.y, closest.x - this.x);
            // 2. Spara
            if (this.cooldown === 0) {
                projectiles.push(new Projectile(this.x, this.y, closest));
                this.cooldown = 60;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = 'gray';
        ctx.fillRect(-10, -10, 20, 20);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, -2, 20, 4);
        ctx.restore();
    }
}

class Crew {
    constructor() {
        this.xp = 0;
        this.efficiency = 1.0;
    }
    gainXP(amount) {
        this.xp += amount;
    }
}
