// --- VARIABILI GLOBALI ---
let core, enemies, turrets, bullets;
let scrap = 100, hp = 100, maxHp = 100;
let wave = 1, enemiesLeft = 0;
let staff = { level: 1, xp: 0, xpToNextLevel: 100 };
let bulletDamage = 10, turretFireRate = 1000, scrapBonus = 0;
let difficultyMultiplier = 1.0;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload: preload, create: create, update: update }
};

let game = new Phaser.Game(config);

// --- CICLO DI VITA PHASER ---

function preload() {
    // Generiamo placeholder grafici
    this.textures.addCanvas('staff_soldier', createStaffTexture('#ff4444'));
    this.textures.addCanvas('staff_engineer', createStaffTexture('#ffff44'));
}

function create() {
    core = this.add.circle(config.width/2, config.height/2, 40, 0x00ffff);
    this.physics.add.existing(core, true);

    enemies = this.physics.add.group();
    turrets = this.add.group();
    bullets = this.physics.add.group();

    this.input.on('pointerdown', (pointer) => {
        if (scrap >= 50) {
            placeTurret(this, pointer.x, pointer.y);
            scrap -= 50;
            updateUI();
        }
    });

    this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
        bullet.destroy();
        let currentHp = enemy.getData('hp') - bulletDamage;
        if (currentHp <= 0) handleEnemyDeath(enemy);
        else enemy.setData('hp', currentHp);
    });

    // Spawn iniziale
    startNextWave();
}

function update() {
    enemies.getChildren().forEach(enemy => {
        this.physics.moveToObject(enemy, core, enemy.getData('speed'));
    });

    turrets.getChildren().forEach(t => {
        let op = t.getData('operator');
        let range = op && op.getData('type') === 'soldier' ? 300 : 200;
        let closest = getClosestEnemy(t, range);
        
        let cooldown = op ? (op.getData('type') === 'soldier' ? 500 : 1000) : 1000;

        if (closest && this.time.now > (t.nextFire || 0)) {
            fireBullet(this, t, closest);
            t.nextFire = this.time.now + cooldown;
        }
    });
}

// --- LOGICA DI GIOCO ---

function placeTurret(scene, x, y) {
    let t = scene.add.circle(x, y, 20, 0x00ff00).setInteractive();
    turrets.add(t);
}

function fireBullet(scene, turret, target) {
    let b = bullets.create(turret.x, turret.y, null);
    scene.physics.moveToObject(b, target, 300);
}

function handleEnemyDeath(enemy) {
    enemy.destroy();
    scrap += (5 + scrapBonus) * difficultyMultiplier;
    enemiesLeft--;
    staff.xp += 10;
    if (staff.xp >= staff.xpToNextLevel) levelUpStaff();
    updateUI();
    if (enemiesLeft <= 0) endWave();
}

function startNextWave() {
    wave++;
    difficultyMultiplier += 0.2;
    enemiesLeft = Math.floor(5 * wave * difficultyMultiplier);
    let spawned = 0;
    let timer = game.scene.scenes[0].time.addEvent({
        delay: 1000 / difficultyMultiplier,
        callback: () => {
            spawnEnemy(difficultyMultiplier);
            spawned++;
            if (spawned >= enemiesLeft) timer.remove();
        },
        loop: true
    });
}

function endWave() {
    scrap += 50 * wave;
    updateUI();
    setTimeout(startNextWave, 3000);
}

function getClosestEnemy(turret, range) {
    let list = enemies.getChildren();
    return list.find(e => Phaser.Math.Distance.Between(turret.x, turret.y, e.x, e.y) < range);
}

function updateUI() {
    document.getElementById('hp').innerText = Math.round(hp) + "%";
    document.getElementById('scrap').innerText = Math.round(scrap);
}

// --- UTILITY ---
function createStaffTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 24; canvas.height = 24;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(12, 12, 10, 0, Math.PI * 2); ctx.fill();
    return canvas;
}

function spawnEnemy(mult) {
    let x = Math.random() > 0.5 ? 0 : config.width;
    let y = Math.random() * config.height;
    let enemy = enemies.create(x, y, null);
    enemy.setData('hp', 20 * mult);
    enemy.setData('speed', 50 * mult);
    // Disegna nemico (placeholder)
    let g = game.scene.scenes[0].add.graphics();
    g.fillStyle(0xff0000, 1);
    g.fillRect(-10, -10, 20, 20);
    enemy.add(g);
}

function levelUpStaff() {
    staff.level++;
    staff.xp = 0;
    staff.xpToNextLevel *= 1.5;
    showUpgradeMenu();
}
