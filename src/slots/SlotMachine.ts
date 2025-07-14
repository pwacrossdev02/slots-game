import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import {Spine} from "pixi-spine";

import {
    SYMBOLS_PER_REEL,
    SYMBOL_SIZE,
    REEL_COUNT,
    REEL_SPACING,
    REEL_HEIGHT
} from '../config/constants';

export class SlotMachine {
    public container: PIXI.Container;
    private reels: Reel[];
    private app: PIXI.Application;
    private isSpinning: boolean = false;
    private spinButton: PIXI.Sprite | null = null;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.reels = [];

        // Center the slot machine
        this.container.x = this.app.screen.width / 2 - ((SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2);
        this.container.y = this.app.screen.height / 2 - ((REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2);

        this.createBackground();

        this.createReels();

        this.initSpineAnimations();
    }

    private createBackground(): void {
        try {
            const background = new PIXI.Graphics();
            background.beginFill(0x000000, 0.5);
            background.drawRect(
                -20,
                -20,
                SYMBOL_SIZE * SYMBOLS_PER_REEL + 40, // Width now based on symbols per reel
                REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
            );
            background.endFill();
            this.container.addChild(background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private createReels(): void {
        // Create each reel
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE);
            reel.container.y = i * (REEL_HEIGHT + REEL_SPACING);
            this.container.addChild(reel.container);
            this.reels.push(reel);
        }
    }

    public update(delta: number): void {
        // Update each reel, speed may vary across devices. Can cap delta to avoid jumps
        const cappedDelta = Math.min(delta, 1.5);
        for (const reel of this.reels) {
            reel.update(cappedDelta);
        }
    }

    public spin(): void {
        if (this.isSpinning) return;

        this.isSpinning = true;

        // Play spin sound
        sound.play('Reel spin', true);

        // Disable spin button
        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('button_spin_disabled.png');
            this.spinButton.interactive = false;
        }

        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].startSpin();
            }, i * 200);
        }

        // Stop all reels after a delay
        setTimeout(() => {
            this.stopSpin();
        }, 500 + (this.reels.length - 1) * 200);

    }

    /*
     * Stops each reel with a staggered delay and listens for when each one completes deceleration.
     * 
     * Instead of using a fixed timeout to determine when all reels have stopped,
     * we now use the `Reel.onStop()` callback. This ensures we precisely know
     * when the final reel finishes its animation, avoiding timing issues.
     * 
     * Benefits:
     * - More accurate handling of reel animations
     * - Prevents premature UI interaction re-enablement
     * - Cleaner and more maintainable code using event-driven design
     */
    private stopSpin(): void {
        let reelsStopped = 0;

        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                const reel = this.reels[i];
                reel.stopSpin();

                // Register a callback to know when this specific reel stops
                reel.onStop(() => {
                    reelsStopped++;

                    // When the last reel finishes its deceleration
                    if (reelsStopped === this.reels.length) {
                        this.checkWin();
                        sound.stop('Reel spin');
                        this.isSpinning = false;

                        if (this.spinButton) {
                            this.spinButton.texture = AssetLoader.getTexture('button_spin.png');
                            this.spinButton.interactive = true;
                        }
                    }
                });
            }, i * 400); // Staggered stop delay
        }
    }

    private checkWin(): void {
        // Simple win check - just for demonstration
        const randomWin = Math.random() < 0.3; // 30% chance of winning

        if (randomWin) {
            sound.play('win', true);
            console.log('Winner!');

            if (this.winAnimation) {
                // TODO: Play the win animation found in "big-boom-h" spine
                this.winAnimation.visible = true;

                const hasBoom = this.winAnimation.state.hasAnimation('boom');
                const animationName = hasBoom ? 'boom' : this.winAnimation.spineData.animations[0].name;

                this.winAnimation.state.setAnimation(0, animationName, false);

                this.winAnimation.state.addListener({
                    complete: () => {
                        this.winAnimation!.visible = false;
                        sound.stop('win');
                    }
                });
            }
        }
    }

    public setSpinButton(button: PIXI.Sprite): void {
        this.spinButton = button;
    }

    private initSpineAnimations(): void {
        try {
            const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData.spineData);

                this.frameSpine.y = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.frameSpine.x = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }

                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('big-boom-h.json');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData.spineData);

                this.winAnimation.x = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.winAnimation.y = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                this.winAnimation.visible = false;

                this.container.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }
}
