class Projectile {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.target = target;
        // Calcolo direzione
        let angle = Math.atan2(target.y - y, target.x - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Verifica collisione semplice
        let dx = this.x - this.target.x;
        let dy = this.y - this.target.y;
        if (Math.sqrt(dx * dx + dy * dy) < 10) {
            this.target.health -= 25; // Danno
            this.active = false;
        }
    }
}
