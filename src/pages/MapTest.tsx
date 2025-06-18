import React from 'react';
import LocationSelector from '@/components/LocationSelector';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MapTest = () => {
  const handleLocationSelected = (location: string) => {
    console.log("Localização selecionada:", location);
    // Aqui você pode salvar em estado ou fazer outras ações
  };

  return (
    <div className="min-h-screen bg-gradient-tinder-dark p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-4 flex items-center">
          <Link to="/">
            <Button variant="outline" size="sm">← Voltar</Button>
          </Link>
          <h1 className="text-white text-xl font-bold ml-4">Teste de Mapa</h1>
        </div>
        
        <LocationSelector 
          onLocationSelected={handleLocationSelected}
          className="mb-8"
        />
        
        <div className="bg-black/60 p-4 rounded-lg text-white text-sm mt-8">
          <h3 className="font-medium mb-2">Como usar:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Digite um endereço no campo acima (ex: "São Paulo, Brasil")</li>
            <li>Aguarde o mapa carregar</li>
            <li>Clique em "Confirmar Localização" se desejar</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MapTest;
