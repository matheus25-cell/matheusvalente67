document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvasTetris");
  const ctx = canvas.getContext("2d");

  const COLUNAS = 10;
  const LINHAS = 20;
  const TAMANHO_BLOCO = canvas.width / COLUNAS;

  let tabuleiro = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill(0));
  let pontos = 0;
  let linhasLimpas = 0;
  let jogoAtivo = true;
  let timerQueda;

  // Peças com estilo 3D (cor base, iluminação e sombra)
  const PECAS = [
    { // I - Cyan
      formato: [[1, 1, 1, 1]],
      cor: '#00E5FF', bordaClara: '#E0FFFF', bordaEspecial: '#008B8B'
    },
    { // J - Azul
      formato: [[1, 0, 0], [1, 1, 1]],
      cor: '#2D62FF', bordaClara: '#80A8FF', bordaEspecial: '#002699'
    },
    { // L - Laranja
      formato: [[0, 0, 1], [1, 1, 1]],
      cor: '#FF8800', bordaClara: '#FFC480', bordaEspecial: '#995200'
    },
    { // O - Amarelo
      formato: [[1, 1], [1, 1]],
      cor: '#FFD700', bordaClara: '#FFF099', bordaEspecial: '#998200'
    },
    { // S - Verde
      formato: [[0, 1, 1], [1, 1, 0]],
      cor: '#00FF66', bordaClara: '#B3FFD1', bordaEspecial: '#00993D'
    },
    { // T - Roxo
      formato: [[0, 1, 0], [1, 1, 1]],
      cor: '#A100FF', bordaClara: '#E2B3FF', bordaEspecial: '#59008C'
    },
    { // Z - Vermelho
      formato: [[1, 1, 0], [0, 1, 1]],
      cor: '#FF2A6D', bordaClara: '#FFB3CB', bordaEspecial: '#990033'
    }
  ];

  let pecaAtual = criarPeca();

  function criarPeca() {
    const idx = Math.floor(Math.random() * PECAS.length);
    const peca = PECAS[idx];
    return {
      ...peca,
      x: Math.floor(COLUNAS / 2) - Math.ceil(peca.formato[0].length / 2),
      y: 0
    };
  }

  // Desenho dos blocos com efeito biselado 3D
  function desenharBloco3D(x, y, pecaInfo) {
    const px = x * TAMANHO_BLOCO;
    const py = y * TAMANHO_BLOCO;
    const tam = TAMANHO_BLOCO;

    // Centro
    ctx.fillStyle = pecaInfo.cor;
    ctx.fillRect(px, py, tam, tam);

    // Borda clara (Luz)
    ctx.fillStyle = pecaInfo.bordaClara;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + tam, py);
    ctx.lineTo(px + tam - 3, py + 3);
    ctx.lineTo(px + 3, py + 3);
    ctx.lineTo(px + 3, py + tam - 3);
    ctx.lineTo(px, py + tam);
    ctx.fill();

    // Borda escura (Sombra)
    ctx.fillStyle = pecaInfo.bordaEspecial;
    ctx.beginPath();
    ctx.moveTo(px + tam, py);
    ctx.lineTo(px + tam, py + tam);
    ctx.lineTo(px, py + tam);
    ctx.lineTo(px + 3, py + tam - 3);
    ctx.lineTo(px + tam - 3, py + tam - 3);
    ctx.lineTo(px + tam - 3, py + 3);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(px, py, tam, tam);
  }

  function desenhar() {
    ctx.fillStyle = '#08090E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let r = 0; r <= LINHAS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * TAMANHO_BLOCO); ctx.lineTo(canvas.width, r * TAMANHO_BLOCO); ctx.stroke();
    }
    for (let c = 0; c <= COLUNAS; c++) {
      ctx.beginPath(); ctx.moveTo(c * TAMANHO_BLOCO, 0); ctx.lineTo(c * TAMANHO_BLOCO, canvas.height); ctx.stroke();
    }

    for (let r = 0; r < LINHAS; r++) {
      for (let c = 0; c < COLUNAS; c++) {
        if (tabuleiro[r][c]) {
          desenharBloco3D(c, r, tabuleiro[r][c]);
        }
      }
    }

    if (pecaAtual) {
      pecaAtual.formato.forEach((linha, r) => {
        linha.forEach((val, c) => {
          if (val) {
            desenharBloco3D(pecaAtual.x + c, pecaAtual.y + r, pecaAtual);
          }
        });
      });
    }
  }

  function colidir(px, py, formato) {
    for (let r = 0; r < formato.length; r++) {
      for (let c = 0; c < formato[r].length; c++) {
        if (formato[r][c]) {
          let novoX = px + c;
          let novoY = py + r;
          if (novoX < 0 || novoX >= COLUNAS || novoY >= LINHAS) return true;
          if (novoY >= 0 && tabuleiro[novoY][novoX]) return true;
        }
      }
    }
    return false;
  }

  function fixarPeca() {
    pecaAtual.formato.forEach((linha, r) => {
      linha.forEach((val, c) => {
        if (val) {
          let py = pecaAtual.y + r;
          let px = pecaAtual.x + c;
          if (py >= 0) {
            tabuleiro[py][px] = {
              cor: pecaAtual.cor,
              bordaClara: pecaAtual.bordaClara,
              bordaEspecial: pecaAtual.bordaEspecial
            };
          }
        }
      });
    });

    limparLinhas();
    pecaAtual = criarPeca();

    if (colidir(pecaAtual.x, pecaAtual.y, pecaAtual.formato)) {
      fimDeJogo();
    }
  }

  function limparLinhas() {
    let linhasCompletas = 0;
    for (let r = LINHAS - 1; r >= 0; r--) {
      if (tabuleiro[r].every(celula => celula !== 0)) {
        tabuleiro.splice(r, 1);
        tabuleiro.unshift(Array(COLUNAS).fill(0));
        linhasCompletas++;
        r++; 
      }
    }

    if (linhasCompletas > 0) {
      linhasLimpas += linhasCompletas;
      pontos += linhasCompletas * 100 * linhasCompletas;
      document.getElementById("pontos").innerText = pontos;
      document.getElementById("linhas").innerText = linhasLimpas;
    }
  }

  function moverBaixo() {
    if (!jogoAtivo) return;
    if (!colidir(pecaAtual.x, pecaAtual.y + 1, pecaAtual.formato)) {
      pecaAtual.y++;
    } else {
      fixarPeca();
    }
    desenhar();
  }

  function moverEsquerda() {
    if (!jogoAtivo) return;
    if (!colidir(pecaAtual.x - 1, pecaAtual.y, pecaAtual.formato)) {
      pecaAtual.x--;
      desenhar();
    }
  }

  function moverDireita() {
    if (!jogoAtivo) return;
    if (!colidir(pecaAtual.x + 1, pecaAtual.y, pecaAtual.formato)) {
      pecaAtual.x++;
      desenhar();
    }
  }

  function girarPeca() {
    if (!jogoAtivo) return;
    const matriz = pecaAtual.formato;
    const novaMatriz = matriz[0].map((_, idx) => matriz.map(row => row[idx]).reverse());
    if (!colidir(pecaAtual.x, pecaAtual.y, novaMatriz)) {
      pecaAtual.formato = novaMatriz;
      desenhar();
    }
  }

  function soltarRapido() {
    if (!jogoAtivo) return;
    while (!colidir(pecaAtual.x, pecaAtual.y + 1, pecaAtual.formato)) {
      pecaAtual.y++;
    }
    fixarPeca();
    desenhar();
  }

  function fimDeJogo() {
    jogoAtivo = false;
    clearInterval(timerQueda);

    ctx.fillStyle = "rgba(15, 17, 26, 0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF2A6D";
    ctx.font = "bold 24px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Poppins";
    ctx.fillText("Pontos: " + pontos, canvas.width / 2, canvas.height / 2 + 25);
  }

  function reiniciarJogo() {
    clearInterval(timerQueda);
    tabuleiro = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill(0));
    pontos = 0;
    linhasLimpas = 0;
    jogoAtivo = true;
    document.getElementById("pontos").innerText = "0";
    document.getElementById("linhas").innerText = "0";
    pecaAtual = criarPeca();
    desenhar();
    timerQueda = setInterval(moverBaixo, 600);
  }

  // Controles de Teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") moverEsquerda();
    if (e.key === "ArrowRight" || e.key === "d") moverDireita();
    if (e.key === "ArrowDown" || e.key === "s") moverBaixo();
    if (e.key === "ArrowUp" || e.key === "w") girarPeca();
    if (e.key === " ") soltarRapido();
  });

  // Controles Touch / Mobile
  document.getElementById("btnRotate").onclick = girarPeca;
  document.getElementById("btnLeft").onclick = moverEsquerda;
  document.getElementById("btnRight").onclick = moverDireita;
  document.getElementById("btnDown").onclick = moverBaixo;
  document.getElementById("btnDrop").onclick = soltarRapido;
  document.getElementById("btnReiniciar").onclick = reiniciarJogo;

  reiniciarJogo();
});

