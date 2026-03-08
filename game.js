const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Variabili Globali ---
let wave = 1;
let crewXP = 0;
let enemies = [new Enemy()];
let projectiles = [];
let myTurret = new Turret(400, 300);

// --- Funzione di Aggiornamento Principale ---
function update() {
    // 1. Gestione Nemici
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.targetIndex >= path.length) {
            enemies.splice(index, 1);
        }
    });

    // 2. Gestione Torretta (passiamo nemici e array proiettili)
    myTurret.update(enemies, projectiles);

    // 3. Gestione Proiettili
    projectiles.forEach((p, i) => {
        p.update();
        if (!p.active) {
            projectiles.splice(i, 1);
        }
    });
    
    // 4. Rimozione nemici morti
    enemies = enemies.filter(e => e.health > 0);
}

// --- Funzione di Disegno ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Disegna nemici
    enemies.forEach(e => e.draw(ctx));
    
    // Disegna torretta
    myTurret.draw(ctx);
    
    // Disegna proiettili
    projectiles.forEach(p => {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// --- Loop del Gioco ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Avvio
gameLoop();
// Inizializzazione
let myCrew = new Crew("Comandante Alpha");
myTurret.assignCrew(myCrew); 

// Esempio: quando un nemico muore, il comandante guadagna XP
function enemyKilled(enemy) {
    if (myTurret.crew) {
        myTurret.crew.gainXP(20);
    }
}
function updateUI() {
    if (myTurret.crew) {
        document.getElementById('crew-level').innerText = myTurret.crew.level;
        document.getElementById('crew-xp').innerText = myTurret.crew.xp;
        document.getElementById('crew-eff').innerText = (1 + myTurret.crew.bonusEfficiency).toFixed(1);
    }
}
let wave = 1;
let enemiesToSpawn = 5;

function spawnWave() {
    for (let i = 0; i < enemiesToSpawn; i++) {
        setTimeout(() => {
            enemies.push(new Enemy());
        }, i * 1000); // Un nemico al secondo
    }
    enemiesToSpawn += 2; // Più nemici alla prossima ondata
    wave++;
}
