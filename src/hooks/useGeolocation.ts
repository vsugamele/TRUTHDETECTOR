import { useState, useEffect } from 'react';

interface GeolocationData {
  city: string;
  region: string;
  country: string;
  countryName: string;
  isLoading: boolean;
  error: string | null;
  isLocalEnvironment: boolean;
  ipAddress?: string;
  lastUpdated?: number;
}

// Lista de cidades brasileiras para fallback
const BRAZILIAN_CITIES = [
  { city: 'São Paulo', region: 'São Paulo', regionCode: 'SP' },
  { city: 'Rio de Janeiro', region: 'Rio de Janeiro', regionCode: 'RJ' },
  { city: 'Brasília', region: 'Distrito Federal', regionCode: 'DF' },
  { city: 'Salvador', region: 'Bahia', regionCode: 'BA' },
  { city: 'Fortaleza', region: 'Ceará', regionCode: 'CE' },
  { city: 'Belo Horizonte', region: 'Minas Gerais', regionCode: 'MG' },
  { city: 'Manaus', region: 'Amazonas', regionCode: 'AM' },
  { city: 'Curitiba', region: 'Paraná', regionCode: 'PR' },
  { city: 'Recife', region: 'Pernambuco', regionCode: 'PE' },
  { city: 'Porto Alegre', region: 'Rio Grande do Sul', regionCode: 'RS' }
];

export const useGeolocation = () => {
  const [geoData, setGeoData] = useState<GeolocationData>({
    city: '',
    region: '',
    country: '',
    countryName: '',
    isLoading: true,
    error: null,
    isLocalEnvironment: false
  });

  useEffect(() => {
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      window.location.hostname.includes('192.168.');

    // Em ambiente local, usar dados simulados
    if (isLocalhost) {
      // Use uma cidade brasileira aleatória
      const randomCity = BRAZILIAN_CITIES[Math.floor(Math.random() * BRAZILIAN_CITIES.length)];
      
      setGeoData({
        city: randomCity.city,
        region: randomCity.region,
        country: 'BR',
        countryName: 'Brasil',
        isLoading: false,
        error: null,
        isLocalEnvironment: true
      });
      return;
    }

    // Versão simplificada usando ipapi.co conforme exemplo fornecido
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        setGeoData({
          city: data.city || '',
          region: data.region || '',
          country: data.country || '',
          countryName: data.country_name || '',
          isLoading: false,
          error: null,
          isLocalEnvironment: false,
          ipAddress: data.ip
        });
      })
      .catch(error => {
        console.error('Erro ao obter localização:', error);
        
        // Fallback para uma cidade brasileira aleatória
        const randomCity = BRAZILIAN_CITIES[Math.floor(Math.random() * BRAZILIAN_CITIES.length)];
        
        setGeoData({
          city: randomCity.city,
          region: randomCity.region,
          country: 'BR',
          countryName: 'Brasil',
          isLoading: false,
          error: 'Usando localização aproximada',
          isLocalEnvironment: false
        });
      });
  }, []);

  return geoData;
};

