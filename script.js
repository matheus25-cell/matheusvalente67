function inicializarTetris() {
  const canvas = document.getElementById("canvasTetris");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const COLUNAS = 10;
  const LINHAS = 20;
  const TAMANHO_BLOCO = canvas.width / COLUNAS;

  let tabuleiro = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill(0));
  let pontos = 0;
  let linhasLimpas = 0;
  let jogoAtivo = true;
  let timerQueda = null;

  const PECAS = [
    { formato: [[1, 1, 1, 1]], cor: '#00E5FF', bordaClara: '#E0FFFF', bordaEspecial: '#008B8B' },
    { formato: [[1, 0, 0], [1, 1, 1]], cor: '#2D62FF', bordaClara: '#80A8FF', bordaEspecial: '#002699' },
    { formato: [[0, 0, 1], [1, 1, 1]], cor: '#FF8800', bordaClara: '#FFC480', bordaEspecial: '#995200' },
    { formato: [[1, 1], [1, 1]], cor: '#FFD700', bordaClara: '#FFF099', bordaEspecial: '#998200' },
    { formato: [[0, 1, 1], [1, 1, 0]], cor: '#00FF66', bordaClara: '#B3FFD1', bordaEspecial: '#00993D' },
    { formato: [[0, 1, 0], [1, 1, 1]], cor: '#A100FF', bordaClara: '#E2B3FF', bordaEspecial: '#59008C' },
    { formato: [[1, 1, 0], [0, 1, 1]], cor: '#FF2A6D', bordaClara: '#FFB3CB', bordaEspecial: '#990033' }
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

  function desenharBloco3D(x, y, pecaInfo) {
    const px = x * TAMANHO_BLOCO;
    const py = y * TAMANHO_BLOCO;
    const tam = TAMANHO_BLOCO;

    ctx.fillStyle = pecaInfo.cor;
    ctx.fillRect(px, py, tam, tam);

    ctx.fillStyle = pecaInfo.bordaClara;
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(px + tam, py); ctx.lineTo(px + tam - 3, py + 3);
    ctx.lineTo(px + 3, py + 3); ctx.lineTo(px + 3, py + tam - 3); ctx.lineTo(px, py + tam);
    ctx.fill();

    ctx.fillStyle = pecaInfo.bordaEspecial;
    ctx.beginPath();
    ctx.moveTo(px + tam, py); ctx.lineTo(px + tam, py + tam); ctx.lineTo(px, py + tam);
    ctx.lineTo(px + 3, py + tam - 3); ctx.lineTo(px + tam - 3, py + tam - 3); ctx.lineTo(px + tam - 3, py + 3);
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
        if (tabuleiro[r][c]) desenharBloco3D(c, r, tabuleiro[r][c]);
      }
    }

    if (pecaAtual) {
      pecaAtual.formato.forEach((linha, r) => {
        linha.forEach((val, c) => {
          if (val) desenharBloco3D(pecaAtual.x + c, pecaAtual.y + r, pecaAtual);
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
    let novoTabuleiro = [];

    for (let r = 0; r < LINHAS; r++) {
      if (tabuleiro[r].every(celula => celula !== 0)) {
        linhasCompletas++;
      } else {
        novoTabuleiro.push(tabuleiro[r]);
      }
    }

    while (novoTabuleiro.length < LINHAS) {
      novoTabuleiro.unshift(Array(COLUNAS).fill(0));
    }

    tabuleiro = novoTabuleiro;

    if (linhasCompletas > 0) {
      linhasLimpas += linhasCompletas;
      pontos += linhasCompletas * 100 * linhasCompletas;
      const elPontos = document.getElementById("pontos");
      const elLinhas = document.getElementById("linhas");
      if (elPontos) elPontos.innerText = pontos;
      if (elLinhas) elLinhas.innerText = linhasLimpas;
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
    if (timerQueda) clearInterval(timerQueda);

    ctx.fillStyle = "rgba(15, 17, 26, 0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF2A6D";
    ctx.font = "bold 22px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "15px Poppins";
    ctx.fillText("Pontos: " + pontos, canvas.width / 2, canvas.height / 2 + 25);
  }

  function reiniciarJogo() {
    if (timerQueda) clearInterval(timerQueda);
    tabuleiro = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill(0));
    pontos = 0;
    linhasLimpas = 0;
    jogoAtivo = true;
    const elPontos = document.getElementById("pontos");
    const elLinhas = document.getElementById("linhas");
    if (elPontos) elPontos.innerText = "0";
    if (elLinhas) elLinhas.innerText = "0";
    pecaAtual = criarPeca();
    desenhar();
    timerQueda = setInterval(moverBaixo, 600);
  }

  document.addEventListener("keydown", (e) => {
    const teclasJogo = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d", "W", "A", "S", "D"];
    if (teclasJogo.includes(e.key)) {
      e.preventDefault();
    }

    const key = e.key.toLowerCase();
    if (key === "arrowleft" || key === "a") moverEsquerda();
    if (key === "arrowright" || key === "d") moverDireita();
    if (key === "arrowdown" || key === "s") moverBaixo();
    if (key === "arrowup" || key === "w") girarPeca();
    if (e.key === " ") soltarRapido();
  });

  const bindAction = (id, fn) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        fn();
      });
    }
  };

  bindAction("btnRotate", girarPeca);
  bindAction("btnLeft", moverEsquerda);
  bindAction("btnRight", moverDireita);
  bindAction("btnDown", moverBaixo);
  bindAction("btnDrop", soltarRapido);
  bindAction("btnReiniciar", reiniciarJogo);

  reiniciarJogo();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarTetris);
} else {
  inicializarTetris();
}