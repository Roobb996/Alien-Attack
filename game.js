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
