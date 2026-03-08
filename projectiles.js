update() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Controllo sicurezza: se il target è sparito, disattiva il proiettile
    if (!this.target || this.target.health <= 0) {
        this.active = false;
        return;
    }
    
    let dx = this.x - this.target.x;
    let dy = this.y - this.target.y;
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
        this.target.health -= 25;
        this.active = false;
    }
}
