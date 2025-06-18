import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PhoneTracker = () => {
  const [searchParams] = useSearchParams();
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneId, setPhoneId] = useState(searchParams.get("id") || "");
  const [location, setLocation] = useState({
    lat: -23.1104,
    lng: -46.5550,
    accuracy: 10,
    timestamp: new Date().toISOString(),
    address: "Atibaia, São Paulo, Brazil"
  });

  // Função para buscar localização pelo ID
  const fetchLocation = async (id) => {
    if (!id.trim()) {
      toast.error("Por favor, insira um ID válido");
      return;
    }
    
    setLoading(true);
    
    try {
      // Em uma implementação real, isto seria uma chamada de API
      // const response = await fetch(`https://sua-api.com/locations/${id}`);
      // const data = await response.json();
      
      // Simulando uma resposta de API com tempo de latência
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Este é apenas um dado simulado
      // Em um app real isto viria do backend
      const mockData = {
        lat: -23.1104 + (Math.random() * 0.01),
        lng: -46.5550 + (Math.random() * 0.01),
        accuracy: Math.floor(Math.random() * 50) + 5,
        timestamp: new Date().toISOString(),
        address: "Atibaia, São Paulo, Brazil"
      };
      
      setLocation(mockData);
      setShowMap(true);
      toast.success("Localização encontrada!");
    } catch (error) {
      console.error("Erro ao buscar localização:", error);
      toast.error("Erro ao buscar localização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar localização automaticamente se o ID estiver presente na URL
  useEffect(() => {
    if (phoneId) {
      fetchLocation(phoneId);
    }
  }, []);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Il telefono che vuoi rintracciare è stato localizzato di recente qui.
      </h1>
      <hr className="border-green-600 mb-6" />
      
      <div className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="Insira o ID do telefone"
          value={phoneId}
          onChange={(e) => setPhoneId(e.target.value)}
        />
        <Button 
          onClick={() => fetchLocation(phoneId)}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Rastrear"}
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-lg text-gray-600">Localizzando il dispositivo...</p>
        </div>
      ) : (
        <div className="relative border border-gray-300 rounded-md h-96">
          {/* Map placeholder - in a real implementation this would use Leaflet/Google Maps */}
          <div className="w-full h-full bg-gray-100 relative" id="map">
            {/* Zoom Controls */}
            <div className="absolute top-2 left-2 flex flex-col">
              <Button variant="outline" className="mb-1 h-8 w-8 flex items-center justify-center bg-white">+</Button>
              <Button variant="outline" className="h-8 w-8 flex items-center justify-center bg-white">−</Button>
            </div>
            
            {/* Map attribution */}
            <div className="absolute bottom-1 right-2 text-xs text-gray-600">
              <span>© Leaflet | Map data © </span>
              <a href="#" className="text-blue-500">OpenStreetMap</a>
              <span> contributors</span>
            </div>
            
            {/* Location marker (red dot) */}
            <div 
              className="absolute" 
              style={{
                left: '50%',
                top: '60%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="h-4 w-4 bg-red-600 rounded-full"></div>
            </div>
            
            {/* Location popup */}
            {showMap && (
              <Card className="absolute shadow-lg w-72 p-0 z-10"
                    style={{
                      left: '50%',
                      top: '40%',
                      transform: 'translateX(-50%)'
                    }}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="text-sm">
                      <p className="font-medium">Localização detectada:</p>
                      <p>{location.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Precisão: ~{location.accuracy}m | {new Date(location.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      ✕
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {showMap && (
        <div className="mt-6 flex justify-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Visualizza dettagli dispositivo
          </Button>
          <Button variant="outline" onClick={() => {
            const shareUrl = `${window.location.origin}/phone-tracker?id=${phoneId}`;
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copiado para a área de transferência!");
          }}>
            Compartilhar link
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhoneTracker;
