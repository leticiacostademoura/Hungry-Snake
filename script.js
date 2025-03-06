// Seleciona o canvas HTML e obtém o contexto 2D para desenhar
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Define o tamanho de cada bloco para o deslocamento da cobra e comida ((como se fosse uma espécie de tabela, aqui é a definiçao de cada quadradinho) 
const box = 20;

// Inicia a cobra com uma posição inicial no centro
//O let é colocado porque esses valores vao mudando conforme a cobra for se mexendo
//A cobra foi feita pelo método de pontos - recebe um array de objetos que representam pontos (coordenadas) em um sistema cartesiano 
let snake = [{ x: 9 * box, y: 10 * box }]; //// isso serve para centralizar a cobra, visto que o box é igual a 20, sendo 9*20 = 180 - a cabeça começará a 180 pixels da borda esquerda do canvas

// Define a direção inicial da cobra
let direction = 'RIGHT';

// Gera a comida em uma posição aleatória
//Math.floor = arredonda um número decimal para baixo 
//Math.random gera um numero aleatório
//A multiplicação por 19 + 1 é usada para garantir que a posição da comida esteja sempre dentro do grid do jogo e não toque as bordas.
let food = {
  x: Math.floor(Math.random() * 19 + 1) * box,
  y: Math.floor(Math.random() * 19 + 1) * box,
};


//inicia a pontuação em 0
let score = 0;
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');

// Controle dos toques na tela
let lastTouch = { x: 0, y: 0 }; // Armazena a posição do último toque

// Função para controlar a direção da cobra com as teclas
function directionControl(event) {
  const key = event.keyCode;
  //aqui, basicamente, ajuda na orientação do vetor (cobra), pois se apertarmos a nossa tecla direita, para o vetor, será a esquerda. Esse processo é feito dentro dessa função
  if (key === 37 && direction !== 'RIGHT') {
    direction = 'LEFT';
  } else if (key === 38 && direction !== 'DOWN') {
    direction = 'UP';
  } else if (key === 39 && direction !== 'LEFT') {
    direction = 'RIGHT';
  } else if (key === 40 && direction !== 'UP') {
    direction = 'DOWN';
  }
}

// Função para controlar a direção da cobra com gestos de toque
function handleTouchStart(event) {
  const touch = event.touches[0]; // Pega o primeiro toque (caso tenha mais de um toque, ele ignora)
  lastTouch.x = touch.clientX;
  lastTouch.y = touch.clientY;
}

function handleTouchMove(event) {
  if (event.touches.length > 1) return; // Ignora se houver mais de um toque

  const touch = event.touches[0];
  const diffX = touch.clientX - lastTouch.x;
  const diffY = touch.clientY - lastTouch.y;

  // Verifica a direção do movimento e determina a orientação da cobra
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0 && direction !== 'LEFT') {
      direction = 'RIGHT';
    } else if (diffX < 0 && direction !== 'RIGHT') {
      direction = 'LEFT';
    }
  } else {
    if (diffY > 0 && direction !== 'UP') {
      direction = 'DOWN';
    } else if (diffY < 0 && direction !== 'DOWN') {
      direction = 'UP';
    }
  }

  lastTouch.x = touch.clientX;
  lastTouch.y = touch.clientY;
}

// Função que vai verificar colisões da cabeça com o corpo
function collision(head, array) {
  // Inicia a verificação a partir do índice 1 para ignorar a cabeça
  for (let i = 1; i < array.length; i++) {
    //compara as coordenadas da cabeça (head.x e head.y) com as coordenadas de cada parte do corpo da cobra (array[i].x e array[i].y).
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

// Função que desenha e atualiza o jogo
function draw() {
  // Limpa o canvas a cada quadro
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha a cobra
  //O for percorre todas as partes da cobra (snake) e, para cada parte, ele desenha um bloco na tela.
  //i === 0 verifica se a parte sendo desenhada é a cabeça da cobra, para que ela tenha uma cor diferente da do corpo.
  for (let i = 0; i < snake.length; i++) {
    // Define a cor da cabeça e do corpo
    ctx.fillStyle = i === 0 ? '#006400' : '#228B22';

    //configura o formato da cobra
    ctx.lineJoin = 'round'; 
    ctx.lineWidth = 1; 

    // Deixa as bordas arredondadas
    ctx.beginPath();
    ctx.moveTo(snake[i].x + box, snake[i].y); 
    ctx.arcTo(snake[i].x + box, snake[i].y + box, snake[i].x, snake[i].y + box, 10); // Arredonda o canto inferior direito
    ctx.arcTo(snake[i].x, snake[i].y + box, snake[i].x, snake[i].y, 10); // Arredonda o canto inferior esquerdo
    ctx.arcTo(snake[i].x, snake[i].y, snake[i].x + box, snake[i].y, 10); // Arredonda o canto superior esquerdo
    ctx.arcTo(snake[i].x + box, snake[i].y, snake[i].x + box, snake[i].y + box, 10); // Arredonda o canto superior direito
    ctx.fill(); // Preenche o quadrado arredondado com a cor
    ctx.strokeStyle = "transparent"; 
    ctx.stroke(); // Desenha a borda
  }

  // Desenha a comida
  ctx.fillStyle = '#FF0000'; 
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2); 
  ctx.fill(); 

  // Cria a cópia da posição inicial da cabeça da cobra
  let head = { ...snake[0] };

  //Instruções para o controle da direção da cobra - imagina o plano cartesiano, a esquerda e pra baixo é negativo
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'DOWN') head.y += box;

  // Verifica se a cobra comeu a comida - se a cabeça e a comida estiverem na mesma posição, a cobra vai crescer 
  if (head.x === food.x && head.y === food.y) {
    score++; // Aumenta a pontuação
    scoreElement.textContent = score; // Atualiza a pontuação no HTML

    // Gera uma nova comida em uma posição aleatória
    food = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box,
    };
  } else {
    // Se não comeu a comida, remove a última parte da cobra
    snake.pop();
  }

  // Adiciona a nova posição da cabeça da cobra no início do array, fazendo a cobra avançar para a nova posição
  snake.unshift(head);

  // Verifica colisões com as paredes ou consigo mesma
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    collision(head, snake)
  ) {
    clearInterval(game); // Para o jogo em caso de colisão
    alert('Game Over! Sua pontuação: ' + score); // Alerta para o jogador que perdeu o jogo + sua pontuação
  }
}

// Função para reiniciar o jogo
function restartGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = 'RIGHT';
  food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box,
  };
  score = 0;
  scoreElement.textContent = score;

  clearInterval(game);
  game = setInterval(draw, 100);
}

// Inicia o jogo
let game;
if (confirm("Você está pronto para iniciar o jogo?")) {
  game = setInterval(draw, 100);

  // Adiciona um evento para reiniciar o jogo com o botão de reinício
  restartButton.addEventListener('click', restartGame);

  // Adiciona os eventos de teclado para controlar a direção
  document.addEventListener('keydown', directionControl);

  // Adiciona os eventos de toque para controlar a direção
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
}
