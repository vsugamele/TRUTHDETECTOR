import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Search, Users, AlertTriangle, Shield, Star, CheckCircle, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProfileVerification from './ProfileVerification';
import AnalyzingProfile from './AnalyzingProfile';
import ProfileResults from './ProfileResults';
import CheckoutPage from './CheckoutPage';
import ActivityMonitor from './ActivityMonitor';

type Step = 'landing' | 'verification' | 'analyzing' | 'results' | 'checkout' | 'success';

interface UserData {
  phone: string;
  gender: string;
  name: string;
  age: string;
  email?: string;
  document?: string;
  profilePhoto?: string;
}

// Declare o tipo da janela global com o Clarity
declare global {
  interface Window {
    clarity?: {
      (method: string, ...args: any[]): void;
    };
  }
}

// Função auxiliar para registrar eventos do Clarity
const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (window.clarity) {
    try {
      window.clarity("event", eventName, eventData);
      console.log(`✅ Clarity event tracked: ${eventName}`, eventData);
    } catch (err) {
      console.error("Error tracking Clarity event:", err);
    }
  }
};

const TinderChecker = () => {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [userData, setUserData] = useState<UserData>({
    phone: '',
    gender: '',
    name: '',
    age: '',
    profilePhoto: undefined
  });

  // Rastreia mudanças de etapas no funil com o Clarity
  useEffect(() => {
    trackEvent("funnel_step_changed", { step: currentStep });

    // Rastrear visualização da página com nomes específicos
    switch(currentStep) {
      case 'landing':
        trackEvent("view_landing_page");
        break;
      case 'verification':
        trackEvent("view_verification_page");
        break;
      case 'analyzing':
        trackEvent("view_analyzing_page");
        break;
      case 'results':
        trackEvent("view_results_page");
        break;
      case 'checkout':
        trackEvent("view_checkout_page");
        break;
      case 'success':
        trackEvent("view_success_page");
        break;
    }
  }, [currentStep]);

  const handleStartVerification = () => {
    trackEvent("click_start_verification");
    setCurrentStep('verification');
  };

  const handleVerificationComplete = (data: UserData) => {
    trackEvent("verification_complete", {
      phoneLength: data.phone.length,
      gender: data.gender,
      name: data.name,
      age: data.age,
      hasProfilePhoto: !!data.profilePhoto
    });

    setUserData({
      phone: data.phone,
      gender: data.gender,
      name: data.name,
      age: data.age,
      profilePhoto: data.profilePhoto
    });
    setCurrentStep('analyzing');
  };

  const handleAnalysisComplete = () => {
    trackEvent("analysis_complete");
    setCurrentStep('results');
  };

  const handlePurchaseReport = () => {
    trackEvent("click_purchase_report");
    setCurrentStep('checkout');
  };

  const handlePaymentSuccess = () => {
    trackEvent("payment_success");
    setCurrentStep('success');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return <LandingPage onStart={handleStartVerification} />;
      case 'verification':
        return <ProfileVerification onComplete={handleVerificationComplete} />;
      case 'analyzing':
        return <AnalyzingProfile onComplete={handleAnalysisComplete} />;
      case 'results':
        return <ProfileResults userData={userData} onPurchase={handlePurchaseReport} />;
      case 'checkout':
        return <CheckoutPage userData={userData} onSuccess={handlePaymentSuccess} />;
      case 'success':
        return <SuccessPage />;
      default:
        return <LandingPage onStart={handleStartVerification} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-tinder-dark">
      {renderStep()}
    </div>
  );
};

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com alerta */}
      <GeoAlert />

      <div className="flex-1 flex flex-col items-center p-4 bg-black">
        <div className="w-full max-w-4xl">
          {/* Título Principal */}
          <div className="text-center text-white my-6">
            <h1 className="text-5xl font-bold mb-4 text-red-600">
              DESCUBRA SE SEU PARCEIRO(A) ESTÁ TE TRAINDO EM 30 SEGUNDOS
            </h1>
            
            <h2 className="text-xl text-white mb-6">
              Em 90 segundos você terá acesso aos mesmos dados que detetives particulares usam
            </h2>
            
            {/* Botão principal destacado */}
            <Button 
              onClick={onStart}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none border-4 border-red-500"
            >
              ⚡ DESCOBRIR A VERDADE AGORA ⚡
            </Button>
          </div>
          
          {/* Grid de cards de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Card 1 - Última atividade */}
            <div className="bg-black border border-red-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900 mb-4">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Última atividade</h3>
              <p className="text-sm">Data da última vez que a pessoa usou redes de relacionamento.</p>
            </div>
            
            {/* Card 2 - Última localização */}
            <div className="bg-black border border-red-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900 mb-4">
                <Search className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Última localização</h3>
              <p className="text-sm">Obtenha a última localização do uso com precisão.</p>
              <img src="/location-map.svg" alt="Mapa de localização" className="mt-3 w-full rounded" />
            </div>
            
            {/* Card 3 - Atualizações do perfil */}
            <div className="bg-black border border-red-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900 mb-4">
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Atualizações do perfil</h3>
              <p className="text-sm">Fotos, biografia, preferência de sexo, contas conectadas.</p>
            </div>
            
            {/* Card 4 - Data de criação */}
            <div className="bg-black border border-red-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Data de criação</h3>
              <p className="text-sm">Saiba exatamente quando a pessoa criou perfis secretos.</p>
            </div>
            
            {/* Card 5 - Verificação da conta */}
            <div className="bg-black border border-red-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900 mb-4">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Verificação da conta</h3>
              <p className="text-sm">Saiba como está a verificação de perfis ocultos.</p>
            </div>
            
            {/* Card 6 - Status da Assinatura */}
            <div className="bg-black border border-red-900 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-900 mb-4">
                <Star className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">Status da Assinatura</h3>
              <p className="text-sm">Saiba se pagou algum pacote de assinatura em apps de relacionamento.</p>
            </div>
          </div>
          
          {/* GALERIA DE EVIDÊNCIAS */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-6">GALERIA DE EVIDÊNCIAS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black border border-red-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-red-600 mb-3">CASOS REAIS DESCOBERTOS</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-300">Screenshot #29371</p>
                      <Badge className="bg-red-800 text-white">Conversas Censuradas</Badge>
                    </div>
                    <div className="h-32 bg-gray-800 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-r from-black via-gray-800 to-black opacity-50"></div>
                      </div>
                      <p className="relative text-red-500 font-mono">[ Conteúdo Censurado - Disponível após verificação ]</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-300">Localização #18293</p>
                      <Badge className="bg-red-800 text-white">Mapa</Badge>
                    </div>
                    <div className="h-40 relative overflow-hidden rounded">
                      {/* Mapa real do OpenStreetMap */}
                      <div className="absolute inset-0">
                        <iframe 
                          className="w-full h-full border-0"
                          title="Mapa de localização suspeita"
                          src="https://www.openstreetmap.org/export/embed.html?bbox=-46.70146,-23.59810,-46.65396,-23.55060&layer=mapnik"
                          style={{ filter: 'brightness(0.7) contrast(1.2) blur(3px)' }}
                        ></iframe>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40 pointer-events-none"></div>

                        {/* Pontos de localização suspeitos */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
                        </div>
                        <div className="absolute top-[40%] left-[60%]">
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <div className="absolute top-[60%] left-[40%]">
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                        </div>
                        
                        <div className="absolute bottom-0 w-full p-1 text-center bg-black bg-opacity-50">
                          <p className="text-xs text-white">Pontos de localização suspeita detectados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-4">Dados reais de investigações concluídas</p>
              </div>
              
              <div className="bg-black border border-red-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-red-600 mb-3">GRÁFICOS DE ATIVIDADE SUSPEITA</h3>
                <div className="space-y-4">
                  <div className="h-40 bg-gray-900 rounded p-2 relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Atividade</span>
                      <span>Frequência</span>
                    </div>
                    <div className="h-32 flex items-end justify-around">
                      <div className="w-6 bg-red-900 h-10" style={{ height: '30%' }}></div>
                      <div className="w-6 bg-red-900 h-12" style={{ height: '40%' }}></div>
                      <div className="w-6 bg-red-700 h-24" style={{ height: '70%' }}></div>
                      <div className="w-6 bg-red-600 h-28" style={{ height: '90%' }}></div>
                      <div className="w-6 bg-red-500 h-32" style={{ height: '100%' }}></div>
                      <div className="w-6 bg-red-600 h-20" style={{ height: '60%' }}></div>
                      <div className="w-6 bg-red-600 h-16" style={{ height: '50%' }}></div>
                    </div>
                    <div className="absolute bottom-1 left-0 right-0 text-center">
                      <p className="text-xs text-red-400">Uso intensificado em horários suspeitos</p>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-gray-900 rounded p-2 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">87%</div>
                      <p className="text-xs text-gray-400">das infidelidades ocorrem em apps de relacionamento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card principal */}
          <Card className="bg-black border border-red-900 text-white mb-6">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-900 to-red-700 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-red-600">
                  Descubra quem está traindo você agora!
                </h1>
                <p className="text-gray-300 text-sm">
                  Nossa ferramenta revela a verdade em segundos. Descubra atividades suspeitas e comunicações ocultas.
                </p>
              </div>

              <Button 
                onClick={onStart}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded-full transition-all duration-300 mb-3"
              >
                🔍 DESCOBRIR A VERDADE AGORA
              </Button>

              <div className="mt-6 pt-4 border-t border-gray-800">
                <p className="text-sm text-red-500 font-semibold text-center mb-2">
                  Notificações Recentes
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  <NotificationAlert name="Marina S." message="descobriu que o marido tinha perfil ativo" time="há 3 min" />
                  <NotificationAlert name="Carlos R." message="encontrou 2 contas secretas da esposa" time="há 7 min" />
                  <NotificationAlert name="Juliana M." message="confirmou suas suspeitas" time="há 12 min" />
                  <NotificationAlert name="Roberto P." message="verificou 3 localizações suspeitas" time="há 18 min" />
                  <NotificationAlert name="Amanda L." message="descobriu mensagens ocultas" time="há 25 min" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials */}
          <div className="space-y-4">
            <TestimonialCard 
              name="Ana S."
              text="Eu desconfiava, mas não tinha como provar. Com essa ferramenta, descobri que meu namorado estava ativo todos os dias."
            />
            <TestimonialCard 
              name="Carlos R."
              text="Minha esposa jurou que tinha apagado o app. Em menos de 1 minuto, vi o perfil dela ativo, com fotos novas."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialCard = ({ name, text }: { name: string; text: string }) => (
  <Card className="bg-black border border-red-900">
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-red-900 to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-white text-sm italic">"{text}"</p>
          <p className="text-red-400 text-xs mt-1 font-medium">{name}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NotificationAlert = ({ name, message, time }: { name: string; message: string; time: string }) => (
  <div className="bg-gray-900 border border-gray-800 rounded p-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-xs text-red-500 font-bold mr-1">{name}</span>
        <span className="text-xs text-gray-300">{message}</span>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  </div>
);

const SuccessPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <Card className="w-full max-w-md bg-black border border-red-900 text-white">
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-red-600">Pagamento Confirmado!</h2>
        <p className="text-gray-300 mb-6">
          Seu relatório completo foi enviado para seu email. Verifique também a caixa de spam.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white"
        >
          Fazer Nova Consulta
        </Button>
      </CardContent>
    </Card>
  </div>
);

const GeoAlert = () => {
  const { city, region, countryName, isLoading, error } = useGeolocation();
  const [remainingTests, setRemainingTests] = useState<number>(Math.floor(Math.random() * 10) + 5); // Entre 5 e 15 testes

  // Diminui um teste a cada 45-75 segundos para criar urgência
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTests(prev => Math.max(1, prev - 1));
    }, Math.floor(Math.random() * 30000) + 45000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black border-b border-red-900 text-white px-4 py-2 text-center font-medium">
        <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin text-red-600" />
        Carregando informações da sua região...
      </div>
    );
  }

  // Localização padrão se não conseguir detectar
  const locationText = city || region || countryName || 'sua região';

  return (
    <div className="bg-black border-b border-red-900 text-red-500 px-4 py-2 text-center font-medium animate-pulse">
      ⚠️ Atenção: Restam apenas <span className="text-white">{remainingTests}</span> verificações de infidelidade hoje!
    </div>
  );
};

export default TinderChecker;
