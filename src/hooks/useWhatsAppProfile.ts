import { useState } from 'react';

interface WhatsAppProfile {
  photoUrl: string;
  number: string;
  hasPhoto: boolean;
}

export const useWhatsAppProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const RAPIDAPI_KEY = 'fd63fa6d46msh0e41d7fe66c27f7p19d2d3jsnf97f1fba2fcf';
  const RAPIDAPI_HOST = 'whatsapp-data.p.rapidapi.com';
  const API_ENDPOINT = `https://${RAPIDAPI_HOST}/wspicture`;

  const formatInternationalNumber = (number: string): string => {
    if (number.length === 11) {
      return '55' + number;
    } else if (number.length === 10) {
      const ddd = number.substring(0, 2);
      const rest = number.substring(2);
      return '55' + ddd + '9' + rest;
    }
    return number;
  };

  const formatBrazilianNumber = (number: string): string => {
    if (number.length === 11) {
      return `(${number.substring(0, 2)}) ${number.substring(2, 7)}-${number.substring(7)}`;
    } else if (number.length === 10) {
      return `(${number.substring(0, 2)}) ${number.substring(2, 6)}-${number.substring(6)}`;
    }
    return number;
  };

  const fetchProfile = async (phoneNumber: string): Promise<WhatsAppProfile | null> => {
    if (!/^\d{10,11}$/.test(phoneNumber)) {
      setError('Digite um número válido com DDD');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const internationalNumber = formatInternationalNumber(phoneNumber);
      
      const response = await fetch(`${API_ENDPOINT}?phone=${internationalNumber}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        },
        // Limita o tempo de espera para 5 segundos
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Acesso proibido. Verifique a chave da API.');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const rawResponseText = await response.text();
      let photoUrl = '';

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const jsonData = JSON.parse(rawResponseText);
          if (jsonData && jsonData.url) {
            photoUrl = jsonData.url;
          }
        } catch (jsonError) {
          console.warn('Erro ao parsear JSON:', jsonError);
        }
      }

      if (!photoUrl && rawResponseText.startsWith('http') && rawResponseText.includes('pps.whatsapp.net')) {
        photoUrl = rawResponseText;
      }

      // Log adicional para debug
      console.log('useWhatsAppProfile - URL da foto encontrada:', photoUrl || 'Nenhuma foto encontrada');
      
      return {
        photoUrl, // Agora sempre será string (vazia se não tiver foto)
        number: formatBrazilianNumber(phoneNumber),
        hasPhoto: !!photoUrl
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchProfile,
    isLoading,
    error
  };
};
