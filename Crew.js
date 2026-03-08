// Aggiungi questo metodo dentro la classe Turret in entities.js
assignCrew(crewMember) {
    this.crew = crewMember;
}

// Modifica la logica di fuoco (dentro update della Turret)
// Invece di this.cooldown = 60;
let baseCooldown = 60;
let bonus = this.crew ? this.crew.bonusEfficiency : 0;
let fireRate = Math.max(10, baseCooldown * (1 - bonus)); // Non scendere sotto 10 frame

if (this.cooldown === 0) {
    projectiles.push(new Projectile(this.x, this.y, closest));
    this.cooldown = Math.floor(fireRate);
}
