const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const listeners = new Map();
const dummyElement = () => ({
  style: {},
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener() {},
  getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 720 }; }
});

const context2d = new Proxy({
  measureText(text) { return { width: String(text).length * 8 }; }
}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return () => {};
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  }
});

const canvas = dummyElement();
canvas.getContext = () => context2d;

const elements = new Map([["gameCanvas", canvas]]);
const document = {
  fullscreenElement: null,
  documentElement: { requestFullscreen: async () => {} },
  exitFullscreen: async () => {},
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, dummyElement());
    return elements.get(id);
  }
};

class InstantImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 64;
    this.naturalHeight = 64;
  }
  set src(value) {
    this._src = value;
    if (this.onload) this.onload();
  }
  get src() { return this._src; }
}

const window = {
  innerWidth: 1280,
  innerHeight: 720,
  location: { search: "" },
  addEventListener(type, callback) { listeners.set(type, callback); }
};

const sandbox = {
  console,
  document,
  window,
  Image: InstantImage,
  URLSearchParams,
  performance: { now: () => 0 },
  requestAnimationFrame() {},
  setTimeout,
  clearTimeout,
  Math
};

const gamePath = path.resolve(__dirname, "..", "game.js");
vm.runInNewContext(fs.readFileSync(gamePath, "utf8"), sandbox, { filename: gamePath });
listeners.get("DOMContentLoaded")();

const game = window.game;
assert.ok(game, "a instância do jogo deve ser criada");

// Caso 1: encostada no tijolo inferior, a Nilda ainda deve conseguir subir.
const lowerBlock = game.blocks.find((block) => block.x === 860 && block.y === 532);
assert.ok(lowerBlock, "o tijolo inferior de regressão deve existir");
game.player.x = lowerBlock.x - game.player.hitW - (game.player.w - game.player.hitW) / 2 + 1;
game.player.y = 448;
game.player.vx = 120;
game.player.vy = -700;
game.resolveMapCollisionsX(game.player);
const lowerPreviousY = game.player.y;
game.player.y += game.player.vy * 0.016;
game.player.grounded = false;
game.resolveMapCollisionsY(game.player, 0.016, lowerPreviousY);
assert.equal(game.player.vy, -700, "o tijolo de baixo não pode cancelar o pulo");
assert.ok(game.player.y < lowerPreviousY, "a Nilda deve continuar subindo junto ao tijolo inferior");

// Caso 2: o bloco superior deve receber o impacto e manter o corpo abaixo dele.
const upperBlock = game.blocks.find((block) => block.x === 560 && block.y === 210);
assert.ok(upperBlock, "o bloco superior de regressão deve existir");
game.player.x = upperBlock.x - 1;
game.player.y = upperBlock.y + upperBlock.h;
game.player.vx = 0;
game.player.vy = -700;
const upperPreviousY = game.player.y;
game.player.y += game.player.vy * 0.016;
game.player.grounded = false;
game.resolveMapCollisionsY(game.player, 0.016, upperPreviousY);
assert.equal(game.player.y, upperBlock.y + upperBlock.h, "o topo da Nilda deve parar abaixo do bloco");
assert.equal(game.player.vy, 30, "o impacto deve interromper a subida");
assert.equal(upperBlock.hit, true, "o bloco de pergunta deve ser ativado");

// Caso 3: tijolo aéreo quebrável desaparece sem teleportar a personagem.
const breakable = game.blocks.find((block) => block.x === 608 && block.y === 210);
assert.ok(breakable, "o tijolo aéreo de regressão deve existir");
game.player.x = breakable.x - 1;
game.player.y = breakable.y + breakable.h;
game.player.vy = -700;
const breakablePreviousY = game.player.y;
game.player.y += game.player.vy * 0.016;
game.resolveMapCollisionsY(game.player, 0.016, breakablePreviousY);
assert.equal(game.player.y, breakable.y + breakable.h, "quebrar o tijolo não pode teleportar a Nilda");
assert.ok(!game.blocks.includes(breakable), "o tijolo aéreo quebrável deve ser removido");

console.log("block collision regression: ok");
