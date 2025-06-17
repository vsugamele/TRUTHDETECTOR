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

type Step = 'landing' | 'verification' | 'analyzing' | 'results' | 'checkout' | 'success';

interface UserData {
  phone: string;
  gender: string;
  name?: string;
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
      hasProfilePhoto: !!data.profilePhoto
    });

    setUserData({
      phone: data.phone,
      gender: data.gender,
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

      <div className="flex-1 flex flex-col items-center p-4 bg-red-500">
        <div className="w-full max-w-4xl">
          {/* Título Principal */}
          <div className="text-center text-white my-6">
            <h1 className="text-5xl font-bold mb-4">
              VOCÊ VAI DESCOBRIR TUDO!
            </h1>
            
            {/* Botão principal destacado */}
            <Button 
              onClick={onStart}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black text-lg font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none border-4 border-white"
            >
              ⚡ INICIAR VERIFICAÇÃO GRATUITA AGORA ⚡
            </Button>
          </div>
          
          {/* Grid de cards de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Card 1 - Última atividade */}
            <div className="bg-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Última atividade</h3>
              <p className="text-sm">Data da última vez que a pessoa usou o Tinder.</p>
            </div>
            
            {/* Card 2 - Última localização */}
            <div className="bg-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Última localização</h3>
              <p className="text-sm">Obtenha a última localização do uso.</p>
              <img src="/location-map.svg" alt="Mapa de localização" className="mt-3 w-full rounded" />
            </div>
            
            {/* Card 3 - Atualizações do perfil */}
            <div className="bg-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Atualizações do perfil</h3>
              <p className="text-sm">Fotos, biografia, preferência de sexo, contas do instagram conectadas.</p>
            </div>
            
            {/* Card 4 - Data de criação */}
            <div className="bg-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Data de criação</h3>
              <p className="text-sm">Saiba exatamente quando a pessoa criou a conta.</p>
            </div>
            
            {/* Card 5 - Verificação da conta */}
            <div className="bg-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verificação da conta</h3>
              <p className="text-sm">Saiba como está a verificação do perfil.</p>
            </div>
            
            {/* Card 6 - Status da Assinatura */}
            <div className="bg-red-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">Status da Assinatura</h3>
              <p className="text-sm">Saiba se pagou algum pacote de assinatura do Tinder.</p>
            </div>
          </div>
          
          {/* Card principal */}
          <Card className="bg-tinder-dark border-gray-700 text-white mb-6">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-tinder rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  Seu parceiro(a) está no Tinder?
                </h1>
                <p className="text-gray-300 text-sm">
                  Descubra a verdade em segundos. Nossa ferramenta de IA verifica se o número de WhatsApp está vinculado a um perfil ativo.
                </p>
              </div>

              <Button 
                onClick={onStart}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-full transition-all duration-300 mb-3"
              >
                🔍 Ver Exemplo de Relatório
              </Button>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                  Não fique na dúvida. Veja quem já descobriu.
                </p>
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
  <Card className="bg-tinder-dark border-gray-700">
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-tinder rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-white text-sm italic">"{text}"</p>
          <p className="text-pink-400 text-xs mt-1 font-medium">{name}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SuccessPage = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md bg-tinder-dark border-gray-700 text-white">
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Pagamento Confirmado!</h2>
        <p className="text-gray-300 mb-6">
          Seu relatório completo foi enviado para seu email. Verifique também a caixa de spam.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-tinder"
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
      <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium">
        <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
        Carregando informações da sua região...
      </div>
    );
  }

  // Localização padrão se não conseguir detectar
  const locationText = city || region || countryName || 'sua região';

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium animate-pulse">
      ⚠️ Atenção: Restam apenas {remainingTests} testes gratuitos para {locationText} hoje!
    </div>
  );
};

export default TinderChecker;
