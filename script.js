const canvas = document.getElementById("canvasJogo");
const ctx = canvas.getContext("2d");

const tamanhoBloco = 20;
const totalBlocos = canvas.width / tamanhoBloco;

let cobrinha = [{ x: 10, y: 10 }];
let comida = { x: 15, y: 15 };
let direcao = "RIGHT";
let proximaDirecao = "RIGHT";
let pontos = 0;
let recorde = localStorage.getItem("recordeCobrinha") || 0;
let loopJogo;
let jogoAtivo = true;

document.getElementById("recorde").innerText = recorde;

// Escuta teclas de atalho (Setas do teclado e WASD)
document.addEventListener("keydown", (event) => {
  const tecla = event.key;
  if ((tecla === "ArrowUp" || tecla === "w" || tecla === "W") && direcao !== "DOWN") proximaDirecao = "UP";
  if ((tecla === "ArrowDown" || tecla === "s" || tecla === "S") && direcao !== "UP") proximaDirecao = "DOWN";
  if ((tecla === "ArrowLeft" || tecla === "a" || tecla === "A") && direcao !== "RIGHT") proximaDirecao = "LEFT";
  if ((tecla === "ArrowRight" || tecla === "d" || tecla === "D") && direcao !== "LEFT") proximaDirecao = "RIGHT";
});

function mudarDirecao(novaDirecao) {
  if (novaDirecao === "UP" && direcao !== "DOWN") proximaDirecao = "UP";
  if (novaDirecao === "DOWN" && direcao !== "UP") proximaDirecao = "DOWN";
  if (novaDirecao === "LEFT" && direcao !== "RIGHT") proximaDirecao = "LEFT";
  if (novaDirecao === "RIGHT" && direcao !== "LEFT") proximaDirecao = "RIGHT";
}

function gerarComida() {
  comida = {
    x: Math.floor(Math.random() * totalBlocos),
    y: Math.floor(Math.random() * totalBlocos)
  };
  cobrinha.forEach(segmento => {
    if (segmento.x === comida.x && segmento.y === comida.y) {
      gerarComida();
    }
  });
}

function atualizar() {
  if (!jogoAtivo) return;

  direcao = proximaDirecao;
  let cabeca = { ...cobrinha[0] };

  if (direcao === "UP") cabeca.y -= 1;
  if (direcao === "DOWN") cabeca.y += 1;
  if (direcao === "LEFT") cabeca.x -= 1;
  if (direcao === "RIGHT") cabeca.x += 1;

  // Colisão com as paredes
  if (cabeca.x < 0 || cabeca.x >= totalBlocos || cabeca.y < 0 || cabeca.y >= totalBlocos) {
    fimDeJogo();
    return;
  }

  // Colisão com o próprio corpo
  for (let i = 0; i < cobrinha.length; i++) {
    if (cobrinha[i].x === cabeca.x && cobrinha[i].y === cabeca.y) {
      fimDeJogo();
      return;
    }
  }

  cobrinha.unshift(cabeca);

  // Comer a fruta
  if (cabeca.x === comida.x && cabeca.y === comida.y) {
    pontos += 10;
    document.getElementById("pontos").innerText = pontos;
    if (pontos > recorde) {
      recorde = pontos;
      localStorage.setItem("recordeCobrinha", recorde);
      document.getElementById("recorde").innerText = recorde;
    }
    gerarComida();
  } else {
    cobrinha.pop();
  }

  desenhar();
}

function desenhar() {
  ctx.fillStyle = "#090A0F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Comida Neon Cyan
  ctx.fillStyle = "#00E5FF";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#00E5FF";
  ctx.fillRect(comida.x * tamanhoBloco, comida.y * tamanhoBloco, tamanhoBloco - 2, tamanhoBloco - 2);

  // Cobra
  cobrinha.forEach((segmento, indice) => {
    ctx.fillStyle = indice === 0 ? "#00E5FF" : "#7B2CBF";
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(segmento.x * tamanhoBloco, segmento.y * tamanhoBloco, tamanhoBloco - 2, tamanhoBloco - 2);
  });

  ctx.shadowBlur = 0;
}

function fimDeJogo() {
  jogoAtivo = false;
  clearInterval(loopJogo);

  ctx.fillStyle = "rgba(15, 17, 26, 0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FF0055";
  ctx.font = "bold 28px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("FIM DE JOGO!", canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "18px Poppins";
  ctx.fillText("Pontuação: " + pontos, canvas.width / 2, canvas.height / 2 + 25);
}

function reiniciarJogo() {
  clearInterval(loopJogo);
  cobrinha = [{ x: 10, y: 10 }];
  direcao = "RIGHT";
  proximaDirecao = "RIGHT";
  pontos = 0;
  jogoAtivo = true;
  document.getElementById("pontos").innerText = "0";
  gerarComida();
  loopJogo = setInterval(atualizar, 120);
}

reiniciarJogo();