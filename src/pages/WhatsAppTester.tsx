import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, PhoneIcon, CheckCircle, XCircle, Image } from 'lucide-react';
import { useWhatsAppProfile } from '@/hooks/useWhatsAppProfile';

const WhatsAppTester: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [responseDetails, setResponseDetails] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [requestStartTime, setRequestStartTime] = useState<number>(0);
  const [requestDuration, setRequestDuration] = useState<number>(0);
  const { fetchProfile, isLoading, error } = useWhatsAppProfile();

  // Função para formatar número de telefone brasileiro (apenas para exibição)
  const formatPhone = (value: string): string => {
    // Remove tudo que não for dígito
    const cleaned = value.replace(/\D/g, '');

    // Limita a 11 dígitos
    const digits = cleaned.substring(0, 11);
    
    setPhoneNumber(digits);
    
    return digits;
  };

  // Teste básico do hook
  const testHook = async () => {
    if (phoneNumber.length < 10) {
      alert('Digite um número de telefone válido com DDD (10 ou 11 dígitos)');
      return;
    }

    try {
      setResponseDetails(null);
      setApiResponse('');
      setRequestStartTime(Date.now());

      console.log(`Iniciando teste com número: ${phoneNumber}`);

      // Faz a chamada direta ao hook
      const result = await fetchProfile(phoneNumber);
      
      const endTime = Date.now();
      setRequestDuration(endTime - requestStartTime);

      console.log("Resposta da API:", result);
      setResponseDetails(result);
      setApiResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("Erro ao testar hook:", err);
    }
  };

  // Teste direto à API RapidAPI
  const testDirectApi = async () => {
    if (phoneNumber.length < 10) {
      alert('Digite um número de telefone válido com DDD (10 ou 11 dígitos)');
      return;
    }

    setResponseDetails(null);
    setApiResponse('');
    setRequestStartTime(Date.now());

    try {
      // Formatar para número internacional
      let internationalNumber = phoneNumber;
      if (phoneNumber.length === 11) {
        internationalNumber = '55' + phoneNumber;
      } else if (phoneNumber.length === 10) {
        const ddd = phoneNumber.substring(0, 2);
        const rest = phoneNumber.substring(2);
        internationalNumber = '55' + ddd + '9' + rest; // Adiciona o 9 para números de 10 dígitos
      }
      
      console.log(`Testando API diretamente com número internacional: ${internationalNumber}`);

      const RAPIDAPI_KEY = 'fd63fa6d46msh0e41d7fe66c27f7p19d2d3jsnf97f1fba2fcf';
      const RAPIDAPI_HOST = 'whatsapp-data.p.rapidapi.com';
      const API_ENDPOINT = `https://${RAPIDAPI_HOST}/wspicture`;

      const response = await fetch(`${API_ENDPOINT}?phone=${internationalNumber}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST
        },
      });
      
      const endTime = Date.now();
      setRequestDuration(endTime - requestStartTime);

      // Informações sobre a resposta HTTP
      const responseInfo = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };

      console.log("Informações da resposta:", responseInfo);

      if (!response.ok) {
        setApiResponse(JSON.stringify({
          error: `HTTP Error: ${response.status} ${response.statusText}`,
          details: responseInfo
        }, null, 2));
        return;
      }

      // Tenta obter o tipo de conteúdo e o corpo da resposta
      const contentType = response.headers.get('content-type');
      const rawData = await response.text();

      console.log("Content-Type:", contentType);
      console.log("Resposta bruta:", rawData);

      // Analisa a resposta com base no tipo de conteúdo
      let processedData: any = { rawResponse: rawData };

      if (contentType && contentType.includes('application/json')) {
        try {
          processedData.json = JSON.parse(rawData);
        } catch (jsonError) {
          processedData.jsonError = String(jsonError);
        }
      }

      if (rawData.startsWith('http') && rawData.includes('pps.whatsapp.net')) {
        processedData.detectedPhotoUrl = rawData;
      }

      setResponseDetails({
        photoUrl: processedData.detectedPhotoUrl || (processedData.json?.url ? processedData.json.url : null),
        hasPhoto: !!(processedData.detectedPhotoUrl || (processedData.json?.url)),
        number: phoneNumber,
        responseInfo
      });

      setApiResponse(JSON.stringify({
        responseInfo,
        processedData
      }, null, 2));
    } catch (err) {
      console.error("Erro ao testar API diretamente:", err);
      setApiResponse(JSON.stringify({
        error: String(err)
      }, null, 2));

      const endTime = Date.now();
      setRequestDuration(endTime - requestStartTime);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Depurador de WhatsApp Profile</h1>
        
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>Teste de API WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex items-center bg-gray-700 px-3 rounded-lg">
                  <span className="text-sm">+55</span>
                </div>
                <Input 
                  type="tel" 
                  placeholder="DDD + número (ex: 11996284159)" 
                  value={phoneNumber} 
                  onChange={(e) => formatPhone(e.target.value)} 
                  maxLength={11} 
                  className="flex-1 bg-gray-700 border-gray-600 text-white" 
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={testHook} 
                  disabled={isLoading || phoneNumber.length < 10}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testando Hook...</>
                  ) : (
                    <><PhoneIcon className="w-4 h-4 mr-2" /> Testar via Hook</>
                  )}
                </Button>

                <Button 
                  onClick={testDirectApi} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-900/30"
                >
                  Testar API Diretamente
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {requestDuration > 0 && (
                <div className="text-xs text-gray-400">
                  Tempo de resposta: {requestDuration}ms
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {responseDetails && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle>Resultado do Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status da Foto:</span>
                  {responseDetails.hasPhoto ? (
                    <span className="text-green-400 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" /> Foto encontrada
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" /> Sem foto
                    </span>
                  )}
                </div>

                {responseDetails.photoUrl && (
                  <div className="space-y-2">
                    <span className="font-medium flex items-center">
                      <Image className="w-4 h-4 mr-1" /> Visualização da Foto:
                    </span>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-700 flex items-center justify-center">
                      <img 
                        src={responseDetails.photoUrl} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                          e.currentTarget.alt = 'Erro ao carregar imagem';
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 break-all">
                      URL: {responseDetails.photoUrl}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="response" className="w-full">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="response">Resposta da API</TabsTrigger>
            <TabsTrigger value="code">Código do Hook</TabsTrigger>
          </TabsList>
          <TabsContent value="response" className="mt-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-4">
                <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-xs text-green-400 max-h-96">
                  {apiResponse || 'Execute um teste para ver a resposta da API...'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="code" className="mt-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-4">
                <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-xs text-blue-400 max-h-96">
{`import { useState } from 'react';

interface WhatsAppProfile {
  photoUrl: string | null;
  number: string;
  hasPhoto: boolean;
}

export const useWhatsAppProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const RAPIDAPI_KEY = 'fd63fa6d46msh0e41d7fe66c27f7p19d2d3jsnf97f1fba2fcf';
  const RAPIDAPI_HOST = 'whatsapp-data.p.rapidapi.com';
  const API_ENDPOINT = \`https://\${RAPIDAPI_HOST}/wspicture\`;

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

  const fetchProfile = async (phoneNumber: string): Promise<WhatsAppProfile | null> => {
    if (!/^\\d{10,11}$/.test(phoneNumber)) {
      setError('Digite um número válido com DDD');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const internationalNumber = formatInternationalNumber(phoneNumber);
      
      const response = await fetch(\`\${API_ENDPOINT}?phone=\${internationalNumber}\`, {
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
        throw new Error(\`Erro HTTP: \${response.status}\`);
      }

      const rawResponseText = await response.text();
      let photoUrl = null;

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

      return {
        photoUrl,
        number: phoneNumber,
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
};`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WhatsAppTester;
