// TODO: Implement sound player using the "howler" package
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
