import React, { useState, useEffect } from 'react';
import LocationMap from './LocationMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelected?: (location: string) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationSelected,
  className = ''
}) => {
  const [location, setLocation] = useState<string>('');
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  
  // Usar o hook de geolocalização já existente
  const { city, region, country, isLoading: isLoadingGeo } = useGeolocation();
  
  // Função para detectar localização usando navegador
  const detectLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Geocodificação reversa usando a API do Mapbox
            const { latitude, longitude } = position.coords;
            const mapboxToken = 'pk.eyJ1IjoidnN1Z2FtZWxlIiwiYSI6ImNtYzF5MW9heTAyamgybnE2cms4d3o5eHIifQ.KQtHjGRDuGMdt8XL2q7g_A';
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,locality,neighborhood`);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              // Extrair nome da cidade, estado e país
              const placeInfo = data.features[0].place_name;
              setLocation(placeInfo);
              setMapVisible(true);
              setIsLoadingLocation(false);
            } else {
              // Fallback para o hook useGeolocation
              const fallbackLocation = [city, region, country].filter(Boolean).join(', ');
              setLocation(fallbackLocation || 'Localização não encontrada');
              setMapVisible(!!fallbackLocation);
              setIsLoadingLocation(false);
            }
          } catch (error) {
            console.error('Erro ao obter localização:', error);
            // Fallback para o hook useGeolocation
            const fallbackLocation = [city, region, country].filter(Boolean).join(', ');
            setLocation(fallbackLocation || 'Localização não encontrada');
            setMapVisible(!!fallbackLocation);
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Erro de geolocalização:', error);
          // Fallback para o hook useGeolocation
          const fallbackLocation = [city, region, country].filter(Boolean).join(', ');
          setLocation(fallbackLocation || 'Localização não encontrada');
          setMapVisible(!!fallbackLocation);
          setIsLoadingLocation(false);
        }
      );
    } else {
      // Navegador não suporta geolocalização
      // Usar o hook de geolocalização como fallback
      const fallbackLocation = [city, region, country].filter(Boolean).join(', ');
      setLocation(fallbackLocation || 'Localização não encontrada');
      setMapVisible(!!fallbackLocation);
      setIsLoadingLocation(false);
    }
  };
  
  // Detectar localização automaticamente ao carregar o componente
  useEffect(() => {
    // Tentar usar a API de geolocalização do navegador primeiro
    if (!location) {
      detectLocation();
    }
  }, []); // Dependência vazia para executar apenas uma vez ao montar

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // Só mostra o mapa quando o usuário digitar pelo menos 5 caracteres
    const shouldShowMap = newLocation.length >= 5;
    setMapVisible(shouldShowMap);
    
    // Notificar o componente pai sobre a mudança de localização
    if (shouldShowMap && onLocationSelected) {
      onLocationSelected(newLocation);
    }
  };

  // Quando o mapa se torna visível, notificar o componente pai
  useEffect(() => {
    if (mapVisible && location && onLocationSelected) {
      onLocationSelected(location);
    }
  }, [mapVisible, location, onLocationSelected]);

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-red-500 p-4 rounded-t-lg">
        <h3 className="text-white text-xl font-bold mb-4 text-center">
          Caso não esteja aparecendo o local onde eles podem estar ativos, digite aqui
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Cidade, Estado, CEP, País"
            className="w-full p-3 rounded-md border border-gray-300 text-gray-900"
          />
          
          <button
            onClick={detectLocation}
            disabled={isLoadingLocation || isLoadingGeo}
            className="bg-white text-red-500 px-3 py-1 rounded-md hover:bg-gray-100 flex items-center justify-center min-w-[44px]"
            aria-label="Detectar localização atual"
            title="Usar minha localização atual"
          >
            {isLoadingLocation || isLoadingGeo ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {mapVisible && (
          <div className="mt-2">
            <LocationMap 
              location={location} 
              width={400} 
              height={180}
              zoom={13}
              className="w-full mb-3 mx-auto"
            />
            <p className="text-gray-800 text-sm font-medium text-center mt-2">
              Digite a última localização conhecida da pessoa
            </p>
          </div>
        )}
      </div>
      

    </div>
  );
};

export default LocationSelector;
