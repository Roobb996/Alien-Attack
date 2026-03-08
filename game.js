const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Variabili Globali ---
let wave = 1;
let enemiesToSpawn = 5;
let isSpawning = false;
let enemies = [];
let projectiles = [];
let myTurret = new Turret(400, 300);

// --- Inizializzazione Crew ---
let myCrew = new Crew("Comandante Alpha");
myTurret.assignCrew(myCrew);

// --- Gestione XP e UI ---
function enemyKilled(enemy) {
    if (myTurret.crew) {
        myTurret.crew.gainXP(20);
    }
    updateUI();
}

function updateUI() {
    // Ondata: wave viene incrementata all'inizio di startNextWave, quindi -1 per mostrare quella corrente
    document.getElementById('wave-count').innerText = wave - 1;

    if (myTurret.crew) {
        document.getElementById('crew-level').innerText = myTurret.crew.level;
        document.getElementById('crew-xp').innerText = myTurret.crew.xp;
        document.getElementById('crew-eff').innerText = (1 + myTurret.crew.bonusEfficiency).toFixed(1);
    }
}

// --- Gestione Ondate ---
function startNextWave() {
    isSpawning = true;
    let count = 0;

    const interval = setInterval(() => {
        enemies.push(new Enemy());
        count++;

        if (count >= enemiesToSpawn) {
            clearInterval(interval);
            isSpawning = false;
        }
    }, 1000);

    enemiesToSpawn += 2;
    wave++;
    updateUI(); // Aggiorna il contatore ondata nell'HTML
}

// --- Funzione di Aggiornamento Principale ---
function update() {
    // 1. Gestione Nemici: movimento lungo il percorso
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.targetIndex >= path.length) {
            enemies.splice(index, 1);
        }
    });

    // 2. Rimozione nemici morti + assegnazione XP
    enemies = enemies.filter(e => {
        if (e.health <= 0) {
            enemyKilled(e);
            return false;
        }
        return true;
    });

    // 3. Gestione Torretta
    myTurret.update(enemies, projectiles);

    // 4. Gestione Proiettili
    projectiles = projectiles.filter(p => {
        p.update();
        return p.active;
    });

    // 5. Avvio prossima ondata se il campo è libero
    if (enemies.length === 0 && !isSpawning) {
        startNextWave();
    }
}

// --- Funzione di Disegno ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    enemies.forEach(e => e.draw(ctx));

    myTurret.draw(ctx);

    projectiles.forEach(p => {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // HUD: numero ondata
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`Ondata: ${wave}`, 10, 20);
}

// --- Loop del Gioco ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Avvio ---
startNextWave(); // Lancia la prima ondata
gameLoop();
