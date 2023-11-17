// Seleccionando elementos
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const panel = document.querySelector(".panel");
const play = document.querySelector(".play");
const mode = document.querySelector("input[type=text]");
const modeValues = document.querySelectorAll(".mode");
const statPanel = document.querySelector(".stat");

const comScore = new Audio();
comScore.src = "resources/audio/comScore.mp3";
const userScore = new Audio();
userScore.src = "resources/audio/userScore.mp3";

// Elección del modo por parte del usuario.
modeValues.forEach((modeValue) => {
    modeValue.addEventListener("click", () => {
        modeValues.forEach((index) => {
            index.classList.remove("selected");
        });
        modeValue.classList.add("selected");
        let value = modeValue.dataset.number;
        mode.value = value;
    });
});
let velodidadInicial; // La velocidad de la computadora que selecciona el conjunto de datos del modo.

canvas.width = 600;
canvas.height = 400;

let user = {
    width: 10,
    height: 100,
    color: "orange",
    x: 10,
    y: (canvas.height - 100) / 2,
    score: 0,
};

let computer = {
    width: 10,
    height: 100,
    color: "green",
    x: canvas.width - 20,
    y: (canvas.height - 100) / 2,
    score: 0,
};

let ball = {
    radius: 10,
    velocity: {
        x: 7,
        y: 7,
    },
    speed: 6,
    color: "white",
    x: canvas.width / 2,
    y: canvas.height / 2,
};

let net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    color: "white",
    width: 2,
    height: 10,
};

// Función para dibujar rectángulos, círculos, texto y la red.
function drawRect(x, y, w, h, c) {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
    ctx.closePath();
}

function drawArc(x, y, r, c) {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawText(text, x, y) {
    ctx.font = "75px arial";
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i < canvas.width; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Plantilla de método para partículas.
class Particle {
    constructor(x, y, color, radius, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.abs(this.radius), 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.radius -= 0.01;
        this.draw();
    }
}

// Movimiento de la paleta del usuario.
canvas.addEventListener("mousemove", (e) => {
    let rect = canvas.getBoundingClientRect().top;
    user.y = e.clientY - rect - user.height / 2;
});

canvas.addEventListener("touchmove", (e) => {
    let rect = canvas.getBoundingClientRect().top;
    user.y = e.changedTouches[0].clientY - rect - user.height / 2;
});

canvas.addEventListener("touchstart", (e) => {
    let rect = canvas.getBoundingClientRect().top;
    user.y = e.changedTouches[0].clientY - rect - user.height / 2;
});

// Detección de colisiones.
function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return (
        p.left < b.right &&
        p.top < b.bottom &&
        p.right > b.left &&
        p.bottom > b.top
    );
}

// Restablecer la pelota
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 0;
    ball.velocity.y = 0;
    ball.velocity.x = 0;

    timeout = setTimeout(() => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 7;
        ball.velocity.y = Math.random() < 0.5 ? 7 : -7;
        ball.velocity.x = Math.random() < 0.5 ? 7 : -7;
        console.log("g");
    }, 1500);
}

// Función de fin de juego.
function gameOver() {
    let stat;
    let maxScore = 5;

    // Estos códigos coinciden con ambos jugadores.
    function commonCodes() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 0;
        cancelAnimationFrame(gameId);
        panel.classList.add("reveal");
    }
    if (user.score >= maxScore) {
        stat = "¡Ganaste!";
        commonCodes();
    } else if (computer.score >= maxScore) {
        stat = "¡Perdiste!";
        commonCodes();
    }
    statPanel.textContent = stat; // La estadística se muestra en el panel de estadísticas.
}

// Función para dibujar los elementos en el tablero.
function draw() {
    drawRect(0, 0, canvas.width, canvas.height, "black");
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(
        computer.x,
        computer.y,
        computer.width,
        computer.height,
        computer.color
    );
    drawArc(ball.x, ball.y, ball.radius, ball.color);
    drawNet();
    drawText(user.score, canvas.width / 4, canvas.height / 5);
    drawText(computer.score, (3 * canvas.width) / 4, canvas.height / 5);
}

let gameId; // El identificador que terminará y comenzará el juego.
let timeout; // La variable para el intervalo de la pelota.
let particles = [];
function game() {
    gameId = requestAnimationFrame(game);
    draw();
    gameOver();

    // Detección de colisiones con las paredes superior e inferior.
    if (
        ball.y + ball.radius + ball.velocity.y > canvas.height ||
        ball.y - ball.radius < 0
    ) {
        ball.velocity.y = -ball.velocity.y;
    }

    // Detección de colisiones con las paredes izquierda y derecha.
    if (ball.x + ball.radius + ball.velocity.x > canvas.width) {
        // Si la pelota toca la pared derecha, el usuario obtiene un punto.
        resetBall();
        userScore.play();
        console.log(userScore);
        user.score += 1;
    } else if (ball.x - ball.radius < 0) {
        // En caso de que la pelota toque la pared izquierda, la computadora obtiene un punto.
        resetBall();
        comScore.play();
        console.log(comScore);
        computer.score += 1;
    }

    // Aumento de la posición de la pelota.
    ball.x += ball.velocity.x / 2;
    ball.y += ball.velocity.y / 2;

    // IA.
    computer.y += (ball.y - (computer.y + computer.height / 2)) * velodidadInicial;

    // Qué jugador golpeará ahora.
    let player = ball.x + ball.radius < canvas.width / 2 ? user : computer;

    // Si se produce una colisión,
    if (collision(ball, player)) {
        // Primero, obtén el punto en el que la paleta golpeó la pelota.
        let collidePoint = ball.y - (player.y + player.height / 2);

        // Luego conviértelo en un número que esté entre 1 y -1.
        collidePoint = collidePoint / (player.height / 2);

        // Luego multiplícalo por 45 grados para obtener un ángulo perfecto entre 45 y -45 grados.
        let angle = (Math.PI / 4) * collidePoint;
        let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
        ball.velocity.x = direction * Math.cos(angle) * ball.speed;
        ball.velocity.y = Math.sin(angle) * ball.speed;

        // Agrega 0.5 a la velocidad de la pelota para hacer el juego más rápido.
        ball.speed += 0.4;

        // Explosión de partículas
        if (player === user) {
            // Dirección de la explosión. En este caso, el usuario.
            for (let i = 0; i < ball.radius; i++) {
                let x = player.x + player.width;
                let y = ball.y + ball.radius;
                particles.push(
                    new Particle(
                        x,
                        y,
                        `hsl(${Math.round(Math.random() * 360)}, 50%, 50%)`,
                        Math.random() * 3 + 0.5,
                        {
                            x: Math.random() * 3,
                            y: (Math.random() - 0.5) * 3,
                        }
                    )
                );
            }
        } else if (player === computer) {
            // Dirección de la explosión. En este caso, la computadora.
            for (let i = 0; i < ball.radius; i++) {
                let x = player.x - player.width;
                let y = ball.y + ball.radius;
                particles.push(
                    new Particle(
                        x,
                        y,
                        `hsl(${Math.round(Math.random() * 360)}, 50%, 50%)`,
                        Math.random() * 3 + 0.5,
                        {
                            x: -Math.random() * 3,
                            y: (Math.random() - 0.5) * 3,
                        }
                    )
                );
            }
        }
    }

    particles.forEach((particle) => {
        // Si el radio es menor o igual a 0, desaparece. Si no, se actualiza.
        if (particle.radius <= 0) {
            particles.splice(particle, 1);
        } else {
            particle.update();
        }
    });
}

// Cuando el jugador presiona el botón "Jugar",
play.addEventListener("click", () => {
    cancelAnimationFrame(gameId); // Restablece el juego anterior.
    user.score = 0; // Restablece la puntuacion.
    computer.score = 0; // Restablece la puntuacion.
    panel.classList.remove("reveal"); // El panel se muestra para dar un mensaje.
    resetBall(); // Restablece la pelota.
    clearTimeout(timeout); // Se cancela el tiempo de espera de la pelota.
    ball.speed = 7; // La velocidad de la pelota vuelve a ser normal.
    ball.velocity = {
        x: 7,
        y: 7,
    };
    if (mode.value == "") {
        // Si el usuario no selecciona un modo, aparece una alerta y la función se detiene.
        alert("¡Por favor, selecciona un modo primero!");
        panel.classList.add("reveal");
        return;
    }
    // Si no, la velocidad de la computadora obtiene el valor del modo.
    velodidadInicial = mode.value;
    // El juego comienza.
    game();
});

// Durante el redimensionamiento,
window.addEventListener("resize", () => {
    redimensionar();
});

function redimensionar() {
    // El ancho mínimo de la ventana debe ser de 620. De lo contrario, aparece una alerta.
    if (window.innerWidth <= 620) {
        alert("¡Gira tu dispositivo, por favor!");
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    } else {
        // O el ancho y alto del lienzo se restablecen.
        canvas.width = 600;
        canvas.height = 400;
    }
}
// Ejecuta la función de redimensionamiento una vez para comprobar si la ventana del usuario coincide perfectamente.
redimensionar();
