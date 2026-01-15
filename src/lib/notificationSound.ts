// Simple notification sound using Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume context if it's suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Pleasant notification sound - two tones
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1); // C#6

    oscillator.type = 'sine';

    // Fade in and out for smooth sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.12);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};
