import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn((cb: Function) => {
    return setTimeout(cb, 16);
  }),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn((id: number) => {
    clearTimeout(id);
  }),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
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
    canvas: {
      width: 500,
      height: 500
    }
  })),
});

Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Zone.js ya es manejado por jest-preset-angular
// No necesitamos inicializar TestBed manualmente

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 