const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let wave = 1;
let crewXP = 0;

function update() {
    // Qui aggiorneremo posizioni nemici, fuoco torrette, ecc.
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Disegna torrette e nemici
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
// In game.js
let enemies = [new Enemy()]; // Iniziamo con un nemico

function update() {
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.targetIndex >= path.length) {
            enemies.splice(index, 1); // Rimosso se raggiunge la fine
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enemies.forEach(e => e.draw(ctx));
}
