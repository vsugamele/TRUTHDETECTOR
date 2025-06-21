import { useEffect, useRef } from 'react';

// Hook para facilitar o uso de sons na aplicação
export const useSound = () => {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Pré-carrega os sons para melhor desempenho
  useEffect(() => {
    const sounds = {
      click: '/sounds/click.mp3',
      notification: '/sounds/notification.mp3',
      success: '/sounds/success.mp3',
      alert: '/sounds/alert.mp3',
      progress: '/sounds/progress.mp3',
    };

    // Pré-carrega todos os sons
    Object.entries(sounds).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audioRefs.current[key] = audio;
    });

    // Limpar referências quando o componente for desmontado
    return () => {
      audioRefs.current = {};
    };
  }, []);

  // Função para tocar um som
  const playSound = (soundName: 'click' | 'notification' | 'success' | 'alert' | 'progress', volume = 0.5) => {
    try {
      if (audioRefs.current[soundName]) {
        const audio = audioRefs.current[soundName];
        audio.volume = volume; // Define o volume (0-1)
        audio.currentTime = 0; // Reinicia o som, para poder tocar várias vezes seguidas
        audio.play().catch(e => console.log(`Erro ao reproduzir som: ${e.message}`));
      } else {
        // Fallback caso o som ainda não tenha sido carregado
        const fallbackAudio = new Audio(`/sounds/${soundName}.mp3`);
        fallbackAudio.volume = volume;
        fallbackAudio.play().catch(e => console.log(`Erro ao reproduzir som: ${e.message}`));
      }
    } catch (error) {
      console.log('Não foi possível tocar o som', error);
    }
  };

  return { playSound };
};
