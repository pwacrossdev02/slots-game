import { Reel } from '../Reel';
import * as PIXI from 'pixi.js';

jest.mock('../../utils/AssetLoader', () => ({
  AssetLoader: {
    getTexture: jest.fn(() => PIXI.Texture.WHITE)
  }
}));

describe('Reel', () => {
  it('should create the correct number of symbols', () => {
    const reel = new Reel(5, 150);
    expect(reel['symbols'].length).toBe(5);
  });

  it('should start spinning when startSpin is called', () => {
    const reel = new Reel(3, 100);
    reel.startSpin();
    expect(reel['isSpinning']).toBe(true);
    expect(reel['speed']).toBeGreaterThan(0);
  });

  it('should stop spinning when stopSpin is called', () => {
    const reel = new Reel(3, 100);
    reel.startSpin();
    reel.stopSpin();
    expect(reel['isSpinning']).toBe(false);
  });

  it('should eventually slow to a stop', () => {
    const reel = new Reel(3, 100);
    reel.startSpin();
    reel.stopSpin();
    for (let i = 0; i < 100; i++) {
      reel.update(1); // simulate multiple frames
    }
    expect(reel['speed']).toBeLessThanOrEqual(0.5);
  });
});