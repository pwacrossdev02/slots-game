// TODO: Implement sound player using the "howler" package

/*
 * Sound Manager using Howler.js
 *
 * This module abstracts sound management into a reusable `sound` object.
 * It supports:
 * - Adding sounds by alias with `add()`
 * - Playing sounds (optionally looping) via `play()`
 * - Stopping specific sounds with `stop()`
 *
 * Why this approach:
 * - Decouples sound logic from game logic
 * - Uses an alias-based sound bank for easy reference and centralized control
 * - Makes unit testing and future sound extensions (e.g. volume, fade) easier
 *
 * Howler.js handles audio compatibility across browsers, so this utility provides
 * a simple wrapper tailored for the slot game's sound needs.
 */

import { Howl } from 'howler';

const soundBank: Record<string, Howl> = {};

export const sound = {
    add: (alias: string, url: string): void => {
        soundBank[alias] = new Howl({ src: [url] });
        console.log(`Sound added: ${alias} from ${url}`);
    },
    play: (alias: string, loop: boolean = false): void => {
        const snd = soundBank[alias];
        if (snd) {
            snd.loop(loop);
            snd.play();
        }
    },
    stop: (alias: string): void => {
        const snd = soundBank[alias];
        if (snd) {
            snd.stop();
        }
    }
};
