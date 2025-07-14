import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';
import { SPIN_SPEED, SLOWDOWN_RATE } from '../config/constants';

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

export class Reel {
    public container: PIXI.Container;
    private symbols: PIXI.Sprite[];
    private symbolSize: number;
    private symbolCount: number;
    private speed: number = 0;
    private isSpinning: boolean = false;

    // This optional callback will be assigned externally using `onStop()`.
    // It's triggered once the reel finishes slowing down and completely stops.
    private onStopCallback?: () => void;

    constructor(symbolCount: number, symbolSize: number) {
        this.container = new PIXI.Container();
        this.symbols = [];
        this.symbolSize = symbolSize;
        this.symbolCount = symbolCount;

        this.applyMask();
        this.createSymbols();
    }

    private createSymbols(): void {
        // Create symbols for the reel, arranged horizontally
        for (let i = 0; i < this.symbolCount; i++) {
            const symbol = this.createRandomSymbol();
            symbol.x = i * this.symbolSize;
            symbol.y = 0;
            symbol.width = this.symbolSize;
            symbol.height = this.symbolSize;

            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }
    }

    private applyMask(): void {
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, this.symbolCount * this.symbolSize, this.symbolSize);
        mask.endFill();

        this.container.addChild(mask);
        this.container.mask = mask;
    }

    private createRandomSymbol(): PIXI.Sprite {
        // TODO:Get a random symbol texture
        const textureName = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
        const texture = AssetLoader.getTexture(textureName);

        // TODO:Create a sprite with the texture
        return new PIXI.Sprite(texture);
    }

    public update(delta: number): void {
        if (!this.isSpinning && this.speed === 0) return;

        // TODO:Move symbols horizontally
        const minX = Math.min(...this.symbols.map(s => s.x)); // Avoid Redundant Calculations in Loops
        for (const symbol of this.symbols) {
            symbol.x += this.speed * delta;

            if (symbol.x > this.symbolCount * this.symbolSize) {
                symbol.x = minX - this.symbolSize;

                const textureName = SYMBOL_TEXTURES[Math.floor(Math.random() * SYMBOL_TEXTURES.length)];
                symbol.texture = AssetLoader.getTexture(textureName);
            }
        }

        // If we're stopping, slow down the reel
        if (!this.isSpinning && this.speed > 0) {
            this.speed *= SLOWDOWN_RATE;

            // If speed is very low, stop completely and snap to grid
            if (this.speed < 0.5) {
                this.speed = 0;
                this.snapToGrid();
                this.onStopCallback?.(); // Notify that the reel has stopped
            }
        }
    }

    private snapToGrid(): void {
        // TODO: Snap symbols to horizontal grid positions
        this.symbols.sort((a, b) => a.x - b.x);

        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            symbol.x = i * this.symbolSize;
        }
    }

    public startSpin(): void {
        this.isSpinning = true;
        this.speed = SPIN_SPEED;
    }

    public stopSpin(): void {
        this.isSpinning = false;
        // The reel will gradually slow down in the update method
    }


    // This method allows other parts of the game (like SlotMachine) to register
    // a custom action to perform after the reel has stopped spinning.
    // Example: checking for win condition, playing a sound, enabling UI.
    public onStop(callback: () => void): void {
        this.onStopCallback = callback;
    }
}
