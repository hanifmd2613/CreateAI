/**
 * AI Voice Bot - Speaks fluent English greetings and instructions using Web Speech API
 */

export const playAiVoiceGreeting = (name: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported on this device/browser');
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances

      const cleanName = name ? name.split(' ')[0] : 'there';
      const greetingText = `Hello ${cleanName}, and welcome to CreateAI.`;

      const utterance = new SpeechSynthesisUtterance(greetingText);
      utterance.rate = 0.92; // Slightly measured, elegant professional cadence
      utterance.pitch = 1.02; // Warm, confident pitch
      utterance.lang = 'en-US';

      // Pick the best natural English voice available
      const selectVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          // Priority: Natural English voices (Google, Samantha, Daniel, Karen, Victoria)
          const preferredVoice = voices.find(v => 
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen') || v.name.includes('Serena')) &&
            (v.lang.startsWith('en') || v.lang === 'en-US' || v.lang === 'en-GB')
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
        }
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        selectVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = selectVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      // Play audio chime tone using Web Audio API before voice
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
          osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25); // G5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        }
      } catch (audioErr) {
        // Fallback silently if audio context is blocked
      }

      // Small delay after chime for realistic AI agent feel
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 250);

    } catch (err) {
      console.warn('Voice synthesis execution failed:', err);
      resolve(false);
    }
  });
};
