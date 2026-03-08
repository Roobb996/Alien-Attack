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
