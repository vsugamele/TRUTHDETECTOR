import React, { useState, useEffect } from 'react';

interface LocationMapProps {
  location: string;
  width?: number;
  height?: number;
  zoom?: number;
  className?: string;
  showPin?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

// Função para gerar URL do mapa estático
const getStaticMapUrl = async (
  location: string,
  width: number,
  height: number,
  zoom: number,
  showPin: boolean,
  mapboxToken: string
): Promise<string> => {
  try {
    // Geocodificar o endereço para obter coordenadas
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      
      // Definir estilo para um mapa mais claro semelhante ao da imagem
      const mapStyle = 'mapbox/streets-v11';
      
      // Adicionar marcador se solicitado
      const marker = showPin ? `pin-s+FF0000(${longitude},${latitude})` : '';
      const markerPart = showPin ? `${marker}/` : '';
      
      // Retornar URL para o mapa estático com @2x para telas de alta resolução
      return `https://api.mapbox.com/styles/v1/${mapStyle}/static/${markerPart}${longitude},${latitude},${zoom},0/${width}x${height}@2x?access_token=${mapboxToken}`;
    }
    throw new Error('Local não encontrado');
  } catch (error) {
    console.error('Erro ao obter mapa:', error);
    throw new Error('Não foi possível carregar o mapa');
  }
};

const LocationMap: React.FC<LocationMapProps> = ({
  location,
  width = 400,
  height = 180,
  zoom = 13,
  className = '',
  showPin = true,
  onLoad,
  onError
}) => {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Token de acesso do Mapbox
  const mapboxToken = 'pk.eyJ1IjoidnN1Z2FtZWxlIiwiYSI6ImNtYzF5MW9heTAyamgybnE2cms4d3o5eHIifQ.KQtHjGRDuGMdt8XL2q7g_A';

  useEffect(() => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    getStaticMapUrl(location, width, height, zoom, showPin, mapboxToken)
      .then(url => {
        setMapUrl(url);
        setIsLoading(false);
        onLoad?.();
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar o mapa';
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      });
  }, [location, width, height, zoom, showPin, onLoad, onError]);

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="flex items-center justify-center bg-gray-200 w-full h-full">
          <div className="text-sm text-gray-600">Carregando mapa...</div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center bg-gray-200 w-full h-full">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      )}
      
      {!isLoading && !error && mapUrl && (
        <img 
          src={mapUrl} 
          alt={`Mapa de ${location}`} 
          width={width} 
          height={height} 
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default LocationMap;
