import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

interface Position {
  x: number;
  y: number;
}

enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

enum GameState {
  Ready = 'READY',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER',
  Paused = 'PAUSED'
}

@Component({
  selector: 'app-snake-game',
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss']
})
export class SnakeGameComponent implements OnInit, OnDestroy {
  // Configuración del juego
  private readonly BOARD_WIDTH = 20;
  private readonly BOARD_HEIGHT = 20;
  private readonly CELL_SIZE = 25;
  
  // Estado del juego
  gameState = GameState.Ready;
  GameState = GameState; // Para usar en template
  
  // Serpiente
  snake: Position[] = [];
  direction: Direction = Direction.Right;
  nextDirection: Direction = Direction.Right;
  
  // Comida
  food: Position = { x: 0, y: 0 };
  

  
  // Puntuación y estadísticas
  score: number = 0;
  level: number = 1;
  highScore: number = 0;
  
  // Velocidad del juego
  private gameSpeed: number = 200;
  private baseGameSpeed: number = 200;
  private turboSpeed: number = 100; // Velocidad cuando se mantiene presionada
  private gameInterval: any;
  private isTurboMode: boolean = false;
  private pressedKeys: Set<string> = new Set();
  
  // Canvas
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  ngOnInit() {
    this.loadHighScore();
    this.initializeGame();
  }

  ngOnDestroy() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.pressedKeys.clear();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.gameState === GameState.Playing) {
      if (event.key === ' ') {
        // Pausar con ESPACIO durante el juego
        this.togglePause();
      } else {
        this.changeDirection(event.key);
        this.handleTurboMode(event.key, true);
      }
    } else if (this.gameState === GameState.Ready) {
      if (event.key === ' ') {
        this.startGame();
      }
    } else if (this.gameState === GameState.GameOver) {
      if (event.key === ' ') {
        this.restartGame();
      }
    } else if (this.gameState === GameState.Paused) {
      if (event.key === ' ') {
        this.resumeGame();
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent) {
    if (this.gameState === GameState.Playing) {
      this.handleTurboMode(event.key, false);
    }
  }

  private initializeGame() {
    setTimeout(() => {
      this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
      
      // Configurar canvas
      this.canvas.width = this.BOARD_WIDTH * this.CELL_SIZE;
      this.canvas.height = this.BOARD_HEIGHT * this.CELL_SIZE;
      
      this.resetGame();
      this.render();
    }, 100);
  }

  private resetGame() {
    // Resetear serpiente en posición inicial (cabeza al frente, cuerpo atrás)
    this.snake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    
    this.direction = Direction.Up;
    this.nextDirection = Direction.Up;
    this.score = 0;
    this.level = 1;
    this.baseGameSpeed = 200;
    this.gameSpeed = 200;
    this.isTurboMode = false;
    this.pressedKeys.clear();
    
    this.generateFood();
    this.gameState = GameState.Ready;
  }

  startGame() {
    this.gameState = GameState.Playing;
    this.restartGameInterval();
  }

  private updateGame() {
    if (this.gameState !== GameState.Playing) return;
    
    // Aplicar el cambio de dirección pendiente
    this.direction = this.nextDirection;
    
    // Calcular nueva posición de la cabeza
    const head = { ...this.snake[0] };
    
    switch (this.direction) {
      case Direction.Up:
        head.y--;
        break;
      case Direction.Down:
        head.y++;
        break;
      case Direction.Left:
        head.x--;
        break;
      case Direction.Right:
        head.x++;
        break;
    }
    
    // Hacer que el tablero sea infinito - aparecer del otro lado
    if (head.x < 0) {
      head.x = this.BOARD_WIDTH - 1;
    } else if (head.x >= this.BOARD_WIDTH) {
      head.x = 0;
    }

    if (head.y < 0) {
      head.y = this.BOARD_HEIGHT - 1;
    } else if (head.y >= this.BOARD_HEIGHT) {
      head.y = 0;
    }
    
    // Verificar colisión con sí misma
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver();
      return;
    }
    
    // Agregar nueva cabeza
    this.snake.unshift(head);
    
    // Verificar si comió comida
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.generateFood();
      this.updateLevel();
    } else {
      // Remover cola si no comió
      this.snake.pop();
    }
    
    this.render();
  }

  private changeDirection(key: string) {
    let newDirection: Direction | null = null;
    
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newDirection = Direction.Up;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newDirection = Direction.Down;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newDirection = Direction.Left;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newDirection = Direction.Right;
        break;
    }
    
    // Solo cambiar dirección si es válida y no es opuesta a la actual
    if (newDirection && this.isValidDirectionChange(newDirection)) {
      this.nextDirection = newDirection;
    }
  }
  
  private isValidDirectionChange(newDirection: Direction): boolean {
    // Prevenir cambios a dirección opuesta
    const oppositeDirections = {
      [Direction.Up]: Direction.Down,
      [Direction.Down]: Direction.Up,
      [Direction.Left]: Direction.Right,
      [Direction.Right]: Direction.Left
    };
    
    return this.direction !== oppositeDirections[newDirection];
  }

  private handleTurboMode(key: string, isPressed: boolean) {
    const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'];
    
    if (movementKeys.includes(key)) {
      if (isPressed) {
        this.pressedKeys.add(key);
      } else {
        this.pressedKeys.delete(key);
      }
      
      const shouldEnableTurbo = this.pressedKeys.size > 0;
      
      if (shouldEnableTurbo && !this.isTurboMode) {
        this.enableTurboMode();
      } else if (!shouldEnableTurbo && this.isTurboMode) {
        this.disableTurboMode();
      }
    }
  }

  private enableTurboMode() {
    this.isTurboMode = true;
    this.gameSpeed = this.turboSpeed;
    this.restartGameInterval();
  }

  private disableTurboMode() {
    this.isTurboMode = false;
    this.gameSpeed = this.baseGameSpeed;
    this.restartGameInterval();
  }

  private restartGameInterval() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameInterval = setInterval(() => {
      this.updateGame();
    }, this.gameSpeed);
  }



  private generateFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.BOARD_WIDTH),
        y: Math.floor(Math.random() * this.BOARD_HEIGHT)
      };
    } while (
      this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y)
    );
  }

  private updateLevel() {
    const newLevel = Math.floor(this.score / 50) + 1;
    if (newLevel > this.level) {
      const oldLevel = this.level;
      this.level = newLevel;
      this.baseGameSpeed = Math.max(100, this.baseGameSpeed - 20);
      this.turboSpeed = Math.max(50, this.turboSpeed - 10);
      

      
      // Actualizar velocidad actual según el modo
      if (this.isTurboMode) {
        this.gameSpeed = this.turboSpeed;
      } else {
        this.gameSpeed = this.baseGameSpeed;
      }
      
      // Reiniciar interval con nueva velocidad
      this.restartGameInterval();
    }
  }

  private gameOver() {
    this.gameState = GameState.GameOver;
    clearInterval(this.gameInterval);
    
    // Limpiar modo turbo
    this.isTurboMode = false;
    this.pressedKeys.clear();
    // Resetear dirección pendiente
    this.nextDirection = this.direction;
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  togglePause() {
    if (this.gameState === GameState.Playing) {
      this.gameState = GameState.Paused;
      clearInterval(this.gameInterval);
      
      // Limpiar modo turbo al pausar
      this.isTurboMode = false;
      this.pressedKeys.clear();
      // Resetear dirección pendiente
      this.nextDirection = this.direction;
    } else if (this.gameState === GameState.Paused) {
      this.resumeGame();
    }
  }

  private resumeGame() {
    this.gameState = GameState.Playing;
    this.restartGameInterval();
  }

  private render() {
    if (!this.ctx) return;
    
    // Limpiar canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar grid
    this.drawGrid();
    

    
    // Dibujar serpiente
    this.drawSnake();
    
    // Dibujar comida
    this.drawFood();
  }

  private drawGrid() {
    this.ctx.strokeStyle = '#16213e';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x <= this.BOARD_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.CELL_SIZE, 0);
      this.ctx.lineTo(x * this.CELL_SIZE, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.CELL_SIZE);
      this.ctx.lineTo(this.canvas.width, y * this.CELL_SIZE);
      this.ctx.stroke();
    }
  }



  private drawSnake() {
    this.snake.forEach((segment, index) => {
      // Cabeza de la serpiente
      if (index === 0) {
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(
          segment.x * this.CELL_SIZE + 1,
          segment.y * this.CELL_SIZE + 1,
          this.CELL_SIZE - 2,
          this.CELL_SIZE - 2
        );
        
        // Ojos de la serpiente
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
          segment.x * this.CELL_SIZE + 5,
          segment.y * this.CELL_SIZE + 5,
          3, 3
        );
        this.ctx.fillRect(
          segment.x * this.CELL_SIZE + 12,
          segment.y * this.CELL_SIZE + 5,
          3, 3
        );
      } else {
        // Cuerpo de la serpiente
        this.ctx.fillStyle = '#8BC34A';
        this.ctx.fillRect(
          segment.x * this.CELL_SIZE + 1,
          segment.y * this.CELL_SIZE + 1,
          this.CELL_SIZE - 2,
          this.CELL_SIZE - 2
        );
      }
    });
  }

  private drawFood() {
    this.ctx.fillStyle = '#FF5722';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.CELL_SIZE + this.CELL_SIZE / 2,
      this.food.y * this.CELL_SIZE + this.CELL_SIZE / 2,
      this.CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('snake-high-score');
      this.highScore = saved ? parseInt(saved) : 0;
    } catch (error) {
      console.error('Error loading high score:', error);
      this.highScore = 0;
    }
  }

  private saveHighScore() {
    localStorage.setItem('snake-high-score', this.highScore.toString());
  }

  restartGame() {
    clearInterval(this.gameInterval);
    this.resetGame();
    this.render();
    // Iniciar automáticamente después de resetear
    this.startGame();
  }
} 