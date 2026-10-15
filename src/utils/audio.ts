export async function playAmharicAudio(text: string, onStateChange?: (playing: boolean) => void): Promise<void> {
  if (!text || !text.trim()) return;

  if (onStateChange) onStateChange(true);

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim().slice(0, 300) }),
    });

    if (!res.ok) {
      throw new Error(`TTS server responded with ${res.status}`);
    }

    const data = await res.json();
    if (data.audioBase64) {
      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(audioUrl);
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          if (onStateChange) onStateChange(false);
          resolve();
        };
        audio.onerror = (e) => {
          if (onStateChange) onStateChange(false);
          reject(e);
        };
        audio.play().catch(reject);
      });
      return;
    }
  } catch (err) {
    console.warn('Backend TTS failed, falling back to speech synthesis if available', err);
    // Fallback: browser speech synthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'am-ET';
        utterance.rate = 0.9;
        utterance.onend = () => {
          if (onStateChange) onStateChange(false);
        };
        utterance.onerror = () => {
          if (onStateChange) onStateChange(false);
        };
        window.speechSynthesis.speak(utterance);
        return;
      } catch (synthErr) {
        console.error('Speech synthesis also failed', synthErr);
      }
    }
  } finally {
    // If not triggered inside promise
    setTimeout(() => {
      if (onStateChange) onStateChange(false);
    }, 1500);
  }
}
