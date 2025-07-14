import { sound } from '../sound';
import { Howl } from 'howler';

jest.mock('howler', () => {
  return {
    Howl: jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      stop: jest.fn(),
      loop: jest.fn()
    }))
  };
});

describe('sound utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a sound using Howl', () => {
    sound.add('win', 'assets/sounds/win.webm');
    expect(Howl).toHaveBeenCalledWith({ src: ['assets/sounds/win.webm'] });
  });

  it('plays a sound with loop = false by default', () => {
    sound.add('spin', 'assets/sounds/spin.webm');
    sound.play('spin');

    const mockInstance = (Howl as jest.Mock).mock.results[0].value;
    expect(mockInstance.loop).toHaveBeenCalledWith(false);
    expect(mockInstance.play).toHaveBeenCalled();
  });

  it('plays a sound with loop = true when specified', () => {
    sound.add('looping', 'assets/sounds/looping.webm');
    sound.play('looping', true);

    const mockInstance = (Howl as jest.Mock).mock.results[0].value;
    expect(mockInstance.loop).toHaveBeenCalledWith(true);
    expect(mockInstance.play).toHaveBeenCalled();
  });

  it('stops a sound if it exists', () => {
    sound.add('reel', 'assets/sounds/reel.webm');
    sound.stop('reel');

    const mockInstance = (Howl as jest.Mock).mock.results[0].value;
    expect(mockInstance.stop).toHaveBeenCalled();
  });

  it('does not throw if trying to stop a nonexistent sound', () => {
    expect(() => sound.stop('nonexistent')).not.toThrow();
  });
});