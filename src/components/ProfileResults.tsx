
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileResultsProps {
  userData: {
    phone: string;
    gender: string;
    profilePhoto?: string;
  };
  onPurchase: () => void;
}

// Função auxiliar para registrar eventos do Clarity
const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (window.clarity) {
    try {
      window.clarity("event", eventName, eventData);
      console.log(`\u2705 Clarity event tracked: ${eventName}`, eventData);
    } catch (err) {
      console.error("Error tracking Clarity event:", err);
    }
  }
};

const ProfileResults = ({ userData, onPurchase }: ProfileResultsProps) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const checkoutSectionRef = React.useRef<HTMLDivElement>(null);

  // Registrar visualização da página de resultados
  useEffect(() => {
    trackEvent("profile_results_viewed", {
      hasProfilePhoto: !!userData.profilePhoto,
      gender: userData.gender,
      phoneDigits: userData.phone.length
    });

    // Registrar eventos de timer
    trackEvent("countdown_timer_started", { initialSeconds: 300 });
  }, []);
  
  // Função para rolar até a seção de checkout
  const scrollToCheckout = () => {
    trackEvent("blurred_content_clicked");
    if (checkoutSectionRef.current) {
      checkoutSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          // Registrar marcos importantes de tempo restante
          if (prev === 180) trackEvent("countdown_3_minutes_left");
          if (prev === 60) trackEvent("countdown_1_minute_left");
          if (prev === 30) trackEvent("countdown_30_seconds_left");
          return prev - 1;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // URLs das fotos embaçadas como exemplo
  const blurredPhotos = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b5c4?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face'
  ];

  return (
    <div className="min-h-screen p-4 bg-gradient-tinder-dark">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Header com alerta */}
        <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium rounded-lg">
          ⚠️ Atenção: Restam apenas 5 testes gratuitos para sua região hoje!
        </div>

        {/* Alerta de perfil encontrado */}
        <Card className="bg-red-900 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-red-300 font-semibold">Alerta: Perfil Ativo Encontrado!</h3>
                <p className="text-red-200 text-sm">
                  Confirmamos que o número está vinculado a um perfil ativo e recentemente usado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fotos protegidas */}
        <Card className="bg-tinder-dark border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-semibold">Fotos e Detalhes Protegidos</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {blurredPhotos.map((photo, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={scrollToCheckout}
                >
                  <img 
                    src={photo} 
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ filter: 'blur(8px)' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                    <span className="text-xs text-white ml-1">Clique para ver</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Seção de conversas embaçadas */}
            <div className="mt-4 space-y-2">
              <div 
                className="bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={scrollToCheckout}
              >
                <div className="text-xs text-gray-400 mb-1 flex justify-between">
                  <span>Conversa suspeita detectada</span>
                  <span className="text-blue-400">Clique para revelar</span>
                </div>
                <div className="text-white text-sm" style={{ filter: 'blur(2px)' }}>
                  "Oi, que tal nos encontrarmos hoje à noite? 😘"
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Mensagem recente</div>
                <div className="text-white text-sm" style={{ filter: 'blur(2px)' }}>
                  "Adorei nossa conversa, quando podemos sair?"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registro de atividades */}
        <Card className="bg-tinder-dark border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-3">Registro de Atividades</h3>
            <div className="space-y-2">
              <ActivityItem 
                icon={<div className="w-2 h-2 bg-red-500 rounded-full" />}
                text="Troca de mensagens suspeita"
                time="5 min atrás"
              />
              <ActivityItem 
                icon={<div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                text="Visto online recentemente"
                time="2 min atrás"
              />
              <ActivityItem 
                icon={<div className="w-2 h-2 bg-blue-500 rounded-full" />}
                text="Online em outra cidade"
                time="1 min atrás"
              />
              <ActivityItem 
                icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
                text="Número confirmado no app"
                time="Agora"
              />
            </div>
            <Button 
              onClick={onPurchase}
              variant="outline" 
              className="w-full mt-3 border-green-500 text-green-400 hover:bg-green-600 hover:text-white bg-gradient-to-r from-green-900 to-tinder-dark animate-pulse hover:animate-none transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔒 Ver Registro Completo
            </Button>
          </CardContent>
        </Card>

        {/* Oferta especial */}
        <Card className="bg-gradient-tinder border-pink-500">
          <CardContent className="p-4 text-center">
            <Badge className="bg-yellow-500 text-black font-bold mb-2">
              💰 Sua Oferta Exclusiva Está Expirando!
            </Badge>
            <div className="text-2xl font-bold text-white mb-1">
              <span className="line-through text-gray-300 text-lg">R$ 67,90</span> R$ 19,90
            </div>
            <p className="text-white text-sm mb-3">Desconto especial por tempo limitado</p>
            
            <div className="bg-red-600 text-white px-3 py-2 rounded-lg mb-4">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">
                  ⏰ TEMPO RESTANTE: {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <Button 
              onClick={() => {
                trackEvent("unlock_report_clicked", { timeRemaining: timeLeft });
                onPurchase();
              }}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-3 rounded-full animate-pulse hover:animate-none transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-green-300"
            >
              📊 DESBLOQUEAR RELATÓRIO AGORA
            </Button>

            <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-200">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Pag. Seguro</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Acesso Imediato</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card className="bg-tinder-dark border-gray-700">
          <CardContent className="p-4">
            <h4 className="text-white font-semibold mb-3 text-center">
              Mais de 75.000 pessoas já descobriram a verdade usando nosso APP Oficial
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-400">75k+</div>
                <div className="text-xs text-gray-400">Relatórios gerados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">99%</div>
                <div className="text-xs text-gray-400">Taxa de sucesso</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">4.9⭐</div>
                <div className="text-xs text-gray-400">Avaliação média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Depoimento */}
        <Card className="bg-tinder-dark border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-tinder rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">C</span>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white font-medium">Carla M.</span>
                  <div className="flex text-yellow-400">
                    {'⭐'.repeat(5)}
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic">
                  "Descobri que meu namorado estava no Tinder há 3 meses. O Tinder Espião me mostrou fotos, conversas e horários de uso. Foi difícil de aceitar mas preferi saber a verdade."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) => (
  <div className="flex items-center space-x-3">
    {icon}
    <span className="text-white text-sm flex-1">{text}</span>
    <span className="text-gray-400 text-xs">{time}</span>
  </div>
);

export default ProfileResults;
