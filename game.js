let wave = 1;
let enemiesToSpawn = 5;
let enemiesLeft = 5;
let waveActive = true;
let difficultyMultiplier = 1.0;
let staff = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    fireRateBonus: 1.0
};

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: { default: 'arcade' },
    scene: { preload: preload, create: create, update: update }
};

let core, enemies, turrets, bullets;
let scrap = 100, hp = 100, wave = 1;
let game = new Phaser.Game(config);

function preload() {
    // Creiamo placeholder grafici (cerchi e quadrati)
}

function create() {
    // 1. IL CORE (La nostra base)
    core = this.add.circle(config.width/2, config.height/2, 40, 0x00ffff);
    this.physics.add.existing(core, true);

    // 2. GRUPPI
    enemies = this.physics.add.group();
    turrets = this.add.group();
    bullets = this.physics.add.group();

    // 3. SPAWN NEMICI (Ogni 3 secondi)
    this.time.addEvent({ delay: 3000, callback: spawnEnemy, callbackScope: this, loop: true });

    // 4. COSTRUZIONE (Click per piazzare torretta)
    this.input.on('pointerdown', (pointer) => {
        if (scrap >= 50) {
            placeTurret(this, pointer.x, pointer.y);
            scrap -= 50;
            updateUI();
        }
    });

    // 5. COLLISIONI
    this.physics.add.overlap(enemies, core, (c, enemy) => {
        enemy.destroy();
        hp -= 10;
        updateUI();
    });
}

function update() {
    // I nemici puntano al core
    enemies.getChildren().forEach(enemy => {
        this.physics.moveToObject(enemy, core, 50);
    });

    // Le torrette sparano al nemico più vicino
    turrets.getChildren().forEach(t => {
        let closest = getClosestEnemy(t, 200);
        if (closest && this.time.now > t.nextFire) {
            fireBullet(this, t, closest);
            t.nextFire = this.time.now + 1000;
        }
    });
}

// --- FUNZIONI DI SUPPORTO ---

function spawnEnemy() {
    let edge = Phaser.Math.Between(0, 3); // Spawn dai bordi
    let x, y;
    if(edge === 0) { x = 0; y = Math.random()*config.height; }
    else { x = config.width; y = Math.random()*config.height; }
    
    let enemy = enemies.create(x, y, null);
    enemy.setCircle(15);
    enemy.setDisplaySize(30, 30);
    // Disegna un quadrato rosso
    let graphics = game.scene.scenes[0].add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-15, -15, 30, 30);
    enemy.add(graphics);
}

function placeTurret(scene, x, y) {
    let t = scene.add.circle(x, y, 20, 0x00ff00);
    t.nextFire = 0;
    turrets.add(t);
}

function updateUI() {
    document.getElementById('hp').innerText = hp + "%";
    document.getElementById('scrap').innerText = scrap;
}

function getClosestEnemy(turret, range) {
    return enemies.getChildren().find(e => Phaser.Math.Distance.Between(turret.x, turret.y, e.x, e.y) < range);
}

function fireBullet(scene, turret, target) {
    let b = bullets.create(turret.x, turret.y, null);
    scene.physics.moveToObject(b, target, 300);
}

class CrewMember {
    constructor(name, type) {
        this.name = name;
        this.type = type; // 'soldier', 'engineer', 'scientist'
        this.level = 1;
        this.experience = 0;
        this.assignedTo = null; // ID della torretta a cui è assegnato
    }

    getBonus() {
        if (this.type === 'soldier') return 0.5 * this.level; // Riduce il cooldown
        if (this.type === 'engineer') return 2 * this.level;  // HP riparati al secondo
        return 0;
    }
}

let myCrew = []; // La tua squadra totale
let recruitmentPool = []; // Membri disponibili da assumere
function recruit(type) {
    let cost = (type === 'soldier') ? 30 : 40;
    if (scrap >= cost) {
        scrap -= cost;
        let newMember = new CrewMember("Recruit " + (myCrew.length + 1), type);
        myCrew.push(newMember);
        updateUI();
        spawnCrewSprite(newMember); // Crea l'icona trascinabile nel gioco
    }
}

function spawnCrewSprite(member) {
    // Crea un piccolo cerchio colorato che rappresenta il membro
    let color = (member.type === 'soldier') ? 0xff0000 : 0xffff00;
    let sprite = game.scene.scenes[0].add.circle(50, 500, 15, color).setInteractive();
    
    // Rendi l'icona trascinabile
    game.scene.scenes[0].input.setDraggable(sprite);

    sprite.on('drag', (pointer, dragX, dragY) => {
        sprite.x = dragX;
        sprite.y = dragY;
    });

    sprite.on('dragend', (pointer) => {
        // Controlla se è sopra una torretta
        let targetTurret = getTurretAt(sprite.x, sprite.y);
        if (targetTurret) {
            targetTurret.operator = member;
            member.assignedTo = targetTurret;
            sprite.x = targetTurret.x;
            sprite.y = targetTurret.y - 30; // Si posiziona sopra la torretta
        }
    });
}

function getTurretAt(x, y) {
    return turrets.getChildren().find(t => Phaser.Math.Distance.Between(x, y, t.x, t.y) < 40);
}
// Dentro update(), nella sezione torrette:
turrets.getChildren().forEach(t => {
    let closest = getClosestEnemy(t, 200);
    
    // Calcola il cooldown: base 1000ms, ridotto se c'è un soldato
    let cooldown = 1000;
    if (t.operator && t.operator.type === 'soldier') {
        cooldown -= (t.operator.getBonus() * 100); 
    }

    if (closest && this.time.now > t.nextFire) {
        fireBullet(this, t, closest);
        t.nextFire = this.time.now + cooldown;
    }
});
// Funzione chiamata quando un proiettile colpisce un nemico
function handleEnemyDeath(enemy) {
    enemy.destroy();
    scrap += 5 * difficultyMultiplier; // Guadagni rottami
    enemiesLeft--;

    // Guadagno XP per il personale
    staff.xp += 10;
    if (staff.xp >= staff.xpToNextLevel) {
        levelUpStaff();
    }

    updateUI();

    // Controllo se l'ondata è finita
    if (enemiesLeft <= 0) {
        endWave();
    }
}

function levelUpStaff() {
    staff.level++;
    staff.xp = 0;
    staff.xpToNextLevel *= 1.5; // Ogni livello è più difficile
    staff.fireRateBonus *= 1.1; // Il personale diventa più veloce a sparare
    console.log("Personale livellato! Livello: " + staff.level);
    // Qui potremmo aprire il menu dei potenziamenti (Roguelite cards)
}

function startNextWave() {
    wave++;
    difficultyMultiplier += 0.2; // Aumenta la difficoltà del 20%
    enemiesToSpawn = Math.floor(5 * wave * difficultyMultiplier);
    enemiesLeft = enemiesToSpawn;
    waveActive = true;
    
    console.log(`Inizio Ondata ${wave}! Nemici: ${enemiesToSpawn}`);
    
    // Timer per spawnare i nemici uno alla volta
    let spawned = 0;
    let spawnTimer = game.scene.scenes[0].time.addEvent({
        delay: 1000 / difficultyMultiplier, // Spawnano più velocemente
        callback: () => {
            spawnEnemy(difficultyMultiplier);
            spawned++;
            if (spawned >= enemiesToSpawn) spawnTimer.remove();
        },
        loop: true
    });
}

function endWave() {
    waveActive = false;
    console.log("Ondata completata! Preparati per la prossima.");
    // Bonus di fine ondata
    scrap += 50 * wave;
    updateUI();
    
    // Pausa di 5 secondi prima della prossima ondata
    setTimeout(startNextWave, 5000);
}
const upgrades = [
    {
        name: "Mura Rinforzate",
        description: "+50 HP Massimi al Core",
        effect: () => { maxHp += 50; hp += 50; }
    },
    {
        name: "Cadenza di Fuoco",
        description: "Le torrette sparano il 20% più velocemente",
        effect: () => { turretFireRate *= 0.8; } // Ridurre il delay significa sparare più veloci
    },
    {
        name: "Munizioni Pesanti",
        description: "+25% Danno proiettili",
        effect: () => { bulletDamage *= 1.25; }
    },
    {
        name: "Riciclo Rapido",
        description: "+2 Scrap per ogni nemico ucciso",
        effect: () => { scrapBonus += 2; }
    }
];
