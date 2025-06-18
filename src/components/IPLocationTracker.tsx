import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
}

const IPLocationTracker = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchStep, setSearchStep] = useState<number>(0);

  // Simular o progresso da busca
  useEffect(() => {
    if (searching) {
      const timer = setInterval(() => {
        setSearchStep(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setSearching(false);
            fetchIPLocation();
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      
      return () => clearInterval(timer);
    }
  }, [searching]);

  const startSearch = () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error("Por favor, insira um número de telefone válido");
      return;
    }
    
    setSearchStep(0);
    setSearching(true);
    setShowMap(false);
    setLocationData(null);
  };

  const fetchIPLocation = async () => {
    setLoading(true);
    try {
      // Usando API pública do ipinfo.io (limite gratuito de 50,000 requisições/mês)
      const response = await fetch("https://ipinfo.io/json?token=6ebc401620e2b9");
      const data = await response.json();
      setLocationData(data);
      setShowMap(true);
      console.log("IP data:", data);
      toast.success("Localização encontrada!");
    } catch (error) {
      console.error("Erro ao obter localização por IP:", error);
      toast.error("Não foi possível determinar a localização");
    } finally {
      setLoading(false);
    }
  };

  // Extrair coordenadas da string loc (formato: "latitude,longitude")
  const getCoordinates = () => {
    if (!locationData?.loc) return { lat: 0, lng: 0 };
    const [lat, lng] = locationData.loc.split(",").map(coord => parseFloat(coord));
    return { lat, lng };
  };

  // Formatar texto de localização
  const getLocationText = () => {
    if (!locationData) return "Localização indisponível";
    return `${locationData.city || "Cidade desconhecida"}, ${locationData.region || "Região desconhecida"}, ${locationData.country || "País desconhecido"}`;
  };
  
  // Texto para cada etapa da busca
  const getSearchStepText = (step: number) => {
    if (step < 20) return "Conectando aos servidores de rastreamento...";
    if (step < 40) return "Consultando operadoras de telefonia...";
    if (step < 60) return "Triangulando sinal do dispositivo...";
    if (step < 80) return "Obtendo dados de geolocalização...";
    return "Finalizando busca...";
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Localizador de Número de Telefone
      </h1>
      <hr className="border-green-600 mb-6" />
      
      <div className="flex items-center space-x-2 mb-6">
        <Input 
          type="tel" 
          placeholder="Digite o número de telefone" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={searching || loading}
        />
        <Button 
          onClick={startSearch}
          disabled={searching || loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {searching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </>
          )}
        </Button>
      </div>



      {searching ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-full h-4 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-300" 
              style={{width: `${searchStep}%`}}
            ></div>
          </div>
          <div className="flex items-center justify-center mb-2">
            <Loader2 className="mr-2 h-8 w-8 text-green-600 animate-spin" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Busca do número em andamento...</p>
          <p className="text-sm text-gray-500 mt-1">{getSearchStepText(searchStep)}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <MapPin className="h-16 w-16 text-green-600 animate-pulse mb-4" />
          <p className="mt-2 text-lg text-gray-600">Detectando a posição...</p>
        </div>
      ) : (
        <div className="relative border border-gray-300 rounded-md h-96">
          {/* Usando um iframe do OpenStreetMap para exibir o mapa */}
          {locationData && (
            <iframe
              className="w-full h-full border-0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationData.loc ? (parseFloat(locationData.loc.split(',')[1]) - 0.01) : -46.565}%2C${locationData.loc ? (parseFloat(locationData.loc.split(',')[0]) - 0.01) : -23.1204}%2C${locationData.loc ? (parseFloat(locationData.loc.split(',')[1]) + 0.01) : -46.545}%2C${locationData.loc ? (parseFloat(locationData.loc.split(',')[0]) + 0.01) : -23.1004}&layer=mapnik&marker=${locationData.loc ? locationData.loc.split(',')[0] : -23.1104}%2C${locationData.loc ? locationData.loc.split(',')[1] : -46.5550}`}
              allowFullScreen
            ></iframe>
          )}
          
          {/* Informações sobrepostas */}
          {showMap && locationData && (
            <Card className="absolute shadow-lg w-72 p-0 z-10"
                  style={{
                    right: '10px',
                    top: '10px',
                  }}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="text-sm">
                    <p className="font-medium">Localização detectada:</p>
                    <p className="font-semibold text-green-700">{getLocationText()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {locationData.ip || "Desconhecido"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Org: {locationData.org || "Não identificado"}
                    </p>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowMap(false)}
                  >
                    ✕
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {showMap && (
        <div className="mt-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Aviso!</strong> Encontramos a localização do dispositivo associado a este número. Estes dados podem não ser 100% precisos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
              // Aqui você poderia redirecionar para uma página de captura de dados do lead
              toast.info("Redirecionando para detalhes completos...");
            }}>
              Ver detalhes completos
            </Button>
            <Button variant="outline" onClick={() => {
              setPhoneNumber("");
              setShowMap(false);
              setLocationData(null);
            }}>
              Nova busca
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPLocationTracker;
