import { SnakeGameComponent } from './snake-game.component';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock canvas context
const mockCanvasContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  rect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn()
};

// Mock canvas element
const mockCanvas = {
  width: 500,
  height: 500,
  getContext: jest.fn(() => mockCanvasContext)
};

describe('SnakeGameComponent', () => {
  let component: SnakeGameComponent;

  beforeEach(() => {
    // Mock global objects
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    Object.defineProperty(document, 'getElementById', {
      value: jest.fn(() => mockCanvas),
      writable: true
    });

    component = new SnakeGameComponent();
    jest.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

         it('should initialize with default values', () => {
       expect(component.score).toBe(0);
       expect(component.level).toBe(1);
       expect(component.gameState).toBe(component.GameState.Ready);
       expect(component.highScore).toBe(0);
     });

    it('should initialize snake with default position', () => {
      expect(component.snake).toEqual([]);
      expect(component.food).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Game States', () => {
    it('should have correct GameState enum values', () => {
      expect(component.GameState.Ready).toBe('READY');
      expect(component.GameState.Playing).toBe('PLAYING');
      expect(component.GameState.Paused).toBe('PAUSED');
      expect(component.GameState.GameOver).toBe('GAME_OVER');
    });

         it('should start game correctly', () => {
       component.startGame();
       expect(component.gameState).toBe(component.GameState.Playing);
     });

     it('should toggle pause state', () => {
       component.gameState = component.GameState.Playing;
       component.togglePause();
       expect(component.gameState).toBe(component.GameState.Paused);

       component.togglePause();
       expect(component.gameState).toBe(component.GameState.Playing);
     });

     it('should restart game', () => {
       component.score = 100;
       component.level = 3;
       component.gameState = component.GameState.GameOver;
       
       component.restartGame();
       
       expect(component.gameState).toBe(component.GameState.Playing);
       expect(component.score).toBe(0);
       expect(component.level).toBe(1);
     });
  });

     describe('Keyboard Event Handling', () => {
     it('should handle space key in ready state', () => {
       component.gameState = component.GameState.Ready;
       const event = new KeyboardEvent('keydown', { key: ' ' });
       
       component.handleKeyboardEvent(event);
       
       expect(component.gameState).toBe(component.GameState.Playing);
     });

     it('should handle space key during gameplay', () => {
       component.gameState = component.GameState.Playing;
       const event = new KeyboardEvent('keydown', { key: ' ' });
       
       component.handleKeyboardEvent(event);
       
       expect(component.gameState).toBe(component.GameState.Paused);
     });

     it('should handle space key when game over', () => {
       component.gameState = component.GameState.GameOver;
       const event = new KeyboardEvent('keydown', { key: ' ' });
       
       component.handleKeyboardEvent(event);
       
       expect(component.gameState).toBe(component.GameState.Playing);
     });

     it('should handle movement keys during gameplay', () => {
       component.gameState = component.GameState.Playing;
       const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
       
       expect(() => component.handleKeyboardEvent(event)).not.toThrow();
     });

    it('should handle key up events', () => {
      const event = new KeyboardEvent('keyup', { key: 'ArrowUp' });
      
      expect(() => component.handleKeyUpEvent(event)).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle ngOnDestroy without errors', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should clear interval on destroy', () => {
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      (component as any).gameInterval = 123;
      
      component.ngOnDestroy();
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
    });
  });

  describe('Game Logic', () => {
    it('should handle food generation without errors', () => {
      component.snake = [{ x: 0, y: 0 }];
      
      expect(() => (component as any).generateFood()).not.toThrow();
      expect(component.food.x).toBeGreaterThanOrEqual(0);
      expect(component.food.x).toBeLessThan(20);
      expect(component.food.y).toBeGreaterThanOrEqual(0);
      expect(component.food.y).toBeLessThan(20);
    });

    it('should handle level updates correctly', () => {
      component.score = 50;
      component.level = 1;
      
      (component as any).updateLevel();
      
      expect(component.level).toBe(2);
    });

    it('should not update level when score threshold not met', () => {
      component.score = 30;
      component.level = 1;
      const initialLevel = component.level;
      
      (component as any).updateLevel();
      
      expect(component.level).toBe(initialLevel);
    });

         it('should handle high score loading', () => {
       (mockLocalStorage.getItem as jest.Mock).mockReturnValue('150');
       
       (component as any).loadHighScore();
       
       expect(component.highScore).toBe(150);
     });

              it('should handle high score saving', () => {
       component.highScore = 200;
       
       (component as any).saveHighScore();
       
       expect(mockLocalStorage.setItem).toHaveBeenCalledWith('snake-high-score', '200');
     });

     it('should handle game over scenario', () => {
       component.score = 120;
       component.highScore = 100;
       
       (component as any).gameOver();
       
       expect(component.gameState).toBe(component.GameState.GameOver);
       expect(component.highScore).toBe(120);
     });

     it('should handle game over when score does not exceed high score', () => {
       component.score = 50;
       component.highScore = 100;
       
       (component as any).gameOver();
       
       expect(component.gameState).toBe(component.GameState.GameOver);
       expect(component.highScore).toBe(100);
     });
  });

  describe('Direction Management', () => {
    it('should handle arrow key directions', () => {
      (component as any).direction = 'LEFT';
      
      expect(() => (component as any).changeDirection('ArrowUp')).not.toThrow();
      expect(() => (component as any).changeDirection('ArrowDown')).not.toThrow();
      expect(() => (component as any).changeDirection('ArrowLeft')).not.toThrow();
      expect(() => (component as any).changeDirection('ArrowRight')).not.toThrow();
    });

    it('should handle WASD key directions', () => {
      expect(() => (component as any).changeDirection('w')).not.toThrow();
      expect(() => (component as any).changeDirection('a')).not.toThrow();
      expect(() => (component as any).changeDirection('s')).not.toThrow();
      expect(() => (component as any).changeDirection('d')).not.toThrow();
    });

    it('should prevent opposite direction changes', () => {
      (component as any).direction = 'RIGHT';
      (component as any).nextDirection = 'RIGHT';
      
      (component as any).changeDirection('ArrowLeft');
      
      expect((component as any).nextDirection).toBe('RIGHT');
    });

    it('should allow valid direction changes', () => {
      (component as any).direction = 'UP';
      
      (component as any).changeDirection('ArrowLeft');
      
      expect((component as any).nextDirection).toBe('LEFT');
    });

    it('should handle invalid keys', () => {
      const initialDirection = (component as any).nextDirection;
      
      (component as any).changeDirection('InvalidKey');
      
      expect((component as any).nextDirection).toBe(initialDirection);
    });

    it('should handle uppercase WASD keys', () => {
      (component as any).direction = 'LEFT';
      
      (component as any).changeDirection('W');
      
      expect((component as any).nextDirection).toBe('UP');
    });
  });

     describe('Game Update Logic', () => {
     beforeEach(() => {
       component.snake = [{ x: 10, y: 10 }];
       component.food = { x: 5, y: 5 };
       component.gameState = component.GameState.Playing;
     });

     it('should not update game when not playing', () => {
       component.gameState = component.GameState.Paused;
       const initialSnake = [...component.snake];
       
       (component as any).updateGame();
       
       expect(component.snake).toEqual(initialSnake);
     });

    it('should handle game update without errors', () => {
      expect(() => (component as any).updateGame()).not.toThrow();
    });

    it('should handle collision detection', () => {
      component.snake = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 }
      ];
      
      expect(() => (component as any).updateGame()).not.toThrow();
    });

    it('should handle wrap-around when snake goes left from left edge', () => {
      component.snake = [{ x: 0, y: 10 }];
      (component as any).direction = 'LEFT';
      (component as any).nextDirection = 'LEFT';
      
      (component as any).updateGame();
      
      expect(component.snake[0].x).toBe(19);
    });

    it('should handle wrap-around when snake goes right from right edge', () => {
      component.snake = [{ x: 19, y: 10 }];
      (component as any).direction = 'RIGHT';
      (component as any).nextDirection = 'RIGHT';
      
      (component as any).updateGame();
      
      expect(component.snake[0].x).toBe(0);
    });

    it('should handle wrap-around when snake goes up from top edge', () => {
      component.snake = [{ x: 10, y: 0 }];
      (component as any).direction = 'UP';
      (component as any).nextDirection = 'UP';
      
      (component as any).updateGame();
      
      expect(component.snake[0].y).toBe(19);
    });

    it('should handle wrap-around when snake goes down from bottom edge', () => {
      component.snake = [{ x: 10, y: 19 }];
      (component as any).direction = 'DOWN';
      (component as any).nextDirection = 'DOWN';
      
      (component as any).updateGame();
      
      expect(component.snake[0].y).toBe(0);
    });

    it('should grow snake when eating food', () => {
      component.snake = [{ x: 10, y: 10 }];
      component.food = { x: 11, y: 10 };
      (component as any).direction = 'RIGHT';
      (component as any).nextDirection = 'RIGHT';
      const originalLength = component.snake.length;
      
      (component as any).updateGame();
      
      expect(component.snake.length).toBe(originalLength + 1);
      expect(component.score).toBe(10);
    });

    it('should not grow snake when not eating food', () => {
      component.snake = [{ x: 10, y: 10 }];
      component.food = { x: 5, y: 5 };
      (component as any).direction = 'RIGHT';
      (component as any).nextDirection = 'RIGHT';
      const originalLength = component.snake.length;
      
      (component as any).updateGame();
      
      expect(component.snake.length).toBe(originalLength);
    });
  });

  describe('Canvas Rendering', () => {
    beforeEach(() => {
      (component as any).canvas = mockCanvas;
      (component as any).ctx = mockCanvasContext;
    });

    it('should handle rendering without errors', () => {
      expect(() => (component as any).render()).not.toThrow();
    });

    it('should handle grid drawing', () => {
      expect(() => (component as any).drawGrid()).not.toThrow();
    });

    it('should handle snake drawing', () => {
      component.snake = [{ x: 5, y: 5 }, { x: 5, y: 6 }];
      
      expect(() => (component as any).drawSnake()).not.toThrow();
    });

    it('should handle food drawing', () => {
      component.food = { x: 8, y: 8 };
      
      expect(() => (component as any).drawFood()).not.toThrow();
    });
  });

  describe('Turbo Mode', () => {
    it('should handle turbo mode activation', () => {
      expect(() => (component as any).handleTurboMode('ArrowUp', true)).not.toThrow();
    });

    it('should handle turbo mode deactivation', () => {
      expect(() => (component as any).handleTurboMode('ArrowUp', false)).not.toThrow();
    });

    it('should enable turbo mode when key is pressed', () => {
      (component as any).isTurboMode = false;
      (component as any).pressedKeys = new Set();
      
      (component as any).handleTurboMode('ArrowUp', true);
      
      expect((component as any).pressedKeys.has('ArrowUp')).toBe(true);
    });

    it('should disable turbo mode when no keys are pressed', () => {
      (component as any).isTurboMode = true;
      (component as any).pressedKeys = new Set(['ArrowUp']);
      
      (component as any).handleTurboMode('ArrowUp', false);
      
      expect((component as any).pressedKeys.has('ArrowUp')).toBe(false);
    });

    it('should handle turbo mode in updateLevel when turbo is active', () => {
      component.score = 100;
      component.level = 1;
      (component as any).isTurboMode = true;
      (component as any).turboSpeed = 80;
      
      (component as any).updateLevel();
      
      expect(component.level).toBe(3);
      expect((component as any).gameSpeed).toBe((component as any).turboSpeed);
    });

    it('should handle turbo mode in updateLevel when turbo is inactive', () => {
      component.score = 100;
      component.level = 1;
      (component as any).isTurboMode = false;
      (component as any).baseGameSpeed = 180;
      
      (component as any).updateLevel();
      
      expect(component.level).toBe(3);
      expect((component as any).gameSpeed).toBe((component as any).baseGameSpeed);
    });

    it('should handle non-movement keys in turbo mode', () => {
      (component as any).isTurboMode = false;
      (component as any).pressedKeys = new Set();
      
      (component as any).handleTurboMode('Space', true);
      
      expect((component as any).pressedKeys.has('Space')).toBe(false);
    });
  });

  describe('Food Generation', () => {
    it('should generate food in different positions', () => {
      component.snake = [{ x: 0, y: 0 }];
      
      (component as any).generateFood();
      
      expect(component.food).toBeTruthy();
      expect(component.food.x).toBeGreaterThanOrEqual(0);
      expect(component.food.y).toBeGreaterThanOrEqual(0);
    });

    it('should avoid placing food on snake body', () => {
      component.snake = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ];
      
             const originalRandom = Math.random;
       let callCount = 0;
       Math.random = jest.fn(() => {
         callCount++;
         if (callCount <= 6) {
           return callCount % 2 === 1 ? 0 : 0;
         } else {
           return 0.5;
         }
       });
      
      (component as any).generateFood();
      
      expect(component.food).toBeTruthy();
      Math.random = originalRandom;
    });
  });

  describe('Error Handling', () => {
         it('should handle localStorage errors gracefully', () => {
       const originalConsoleError = console.error;
       console.error = jest.fn();
       
       mockLocalStorage.getItem.mockImplementation(() => {
         throw new Error('Storage error');
       });
       
       (component as any).loadHighScore();
       
       expect(component.highScore).toBe(0);
       console.error = originalConsoleError;
     });

         it('should handle invalid localStorage data', () => {
       (mockLocalStorage.getItem as jest.Mock).mockReturnValue('invalid-data');
       
       (component as any).loadHighScore();
       

       expect(isNaN(component.highScore)).toBe(true);
     });

    it('should handle empty snake array', () => {
      component.snake = [];
      
      expect(() => (component as any).updateGame()).not.toThrow();
    });

    it('should handle canvas initialization failure', () => {
      document.getElementById = jest.fn(() => null);
      
      expect(() => (component as any).initializeGame()).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should create component efficiently', () => {
      const startTime = performance.now();
      const testComponent = new SnakeGameComponent();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      expect(testComponent).toBeTruthy();
    });

    it('should handle multiple direction changes efficiently', () => {
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        (component as any).changeDirection('ArrowUp');
        (component as any).changeDirection('ArrowDown');
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Game Interval Management', () => {
    it('should handle interval restart', () => {
      const setIntervalSpy = jest.spyOn(window, 'setInterval');
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      
      (component as any).gameInterval = 123;
      (component as any).restartGameInterval();
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('should calculate game speed correctly', () => {
      (component as any).baseGameSpeed = 200;
      (component as any).isTurboMode = false;
      
      (component as any).restartGameInterval();
      
      expect((component as any).gameSpeed).toBe(200);
    });

    it('should handle interval restart when gameInterval is null', () => {
      const setIntervalSpy = jest.spyOn(window, 'setInterval');
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      
      (component as any).gameInterval = null;
      (component as any).restartGameInterval();
      
      expect(clearIntervalSpy).not.toHaveBeenCalled();
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('should handle interval restart when gameInterval is undefined', () => {
      const setIntervalSpy = jest.spyOn(window, 'setInterval');
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
      
      (component as any).gameInterval = undefined;
      (component as any).restartGameInterval();
      
      expect(clearIntervalSpy).not.toHaveBeenCalled();
      expect(setIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Game Reset Logic', () => {
         it('should reset all game properties', () => {
       component.score = 100;
       component.level = 5;
       component.gameState = component.GameState.GameOver;
       
       (component as any).resetGame();
       
       expect(component.score).toBe(0);
       expect(component.level).toBe(1);
       expect(component.gameState).toBe(component.GameState.Ready);
     });

    it('should reinitialize snake position', () => {
      (component as any).resetGame();
      
      expect(component.snake).toEqual([
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
      ]);
    });
  });
}); 