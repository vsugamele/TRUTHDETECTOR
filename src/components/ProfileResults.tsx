import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Clock, MapPin, Lock, CheckCircle, Info, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActivityMonitor from './ActivityMonitor';

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

  // Prepara a lista de fotos a serem mostradas
  const getPhotosToDisplay = () => {
    // URLs das fotos embaçadas como exemplo
    const defaultPhotos = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b5c4?w=200&h=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face'
    ];
    
    // Se temos a foto do usuário, substitui a primeira foto por ela
    if (userData.profilePhoto) {
      return [userData.profilePhoto, ...defaultPhotos.slice(0, 2)];
    }
    
    // Caso contrário, retorna as fotos padrão
    return defaultPhotos;
  };
  
  const blurredPhotos = getPhotosToDisplay();

  return (
    <div className="min-h-screen p-4 bg-gradient-tinder-dark">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Box de investigação concluída - Com paleta otimizada */}
        <div className="border-2 border-blue-700 rounded-lg overflow-hidden bg-black">
          <div className="bg-blue-900 px-4 py-3 text-center font-bold tracking-wide uppercase text-white">
            <span className="text-sm">INVESTIGAÇÃO CONCLUÍDA</span>
          </div>
          
          <div className="p-6 text-center">
            {/* Mostrar foto do usuário quando disponível */}
            {userData.profilePhoto && (
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500">
                  <img 
                    src={userData.profilePhoto} 
                    alt="Perfil" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-4 text-base font-bold text-white">
              <CheckCircle className="h-5 w-5 text-green-500 inline mr-2" /> 
              <span>7 ATIVIDADES SUSPEITAS CONFIRMADAS</span>
            </div>
            
            <button
              onClick={onPurchase}
              className="w-full bg-red-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wider text-xl flex items-center justify-center my-4"
            >
              VER RELATÓRIO COMPLETO AGORA
            </button>
            
            <div className="text-gray-400 text-xs flex items-center justify-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Acesso expira em: </span>
              <span className="font-mono font-bold text-orange-400 ml-1">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Monitor de atividades suspeitas */}
        <ActivityMonitor onViewRegistryClick={onPurchase} />

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

        {/* Oferta especial - Otimizada */}
        <Card className="bg-black border border-blue-700">
          <CardContent className="p-5" ref={checkoutSectionRef}>
            <h3 className="text-lg font-bold text-center text-blue-400 mb-2">
              OFERTA ESPECIAL
            </h3>
            <p className="text-center text-gray-300 text-sm mb-3">
              Acesso ao relatório completo com todas as atividades detectadas, fotos e localizações.
            </p>
            
            <div className="text-center font-bold text-white mb-1">
              <span className="line-through text-gray-400 text-sm">R$ 67,90</span> 
              <span className="text-green-500 text-2xl ml-2">R$ 19,90</span>
            </div>
            <p className="text-orange-400 text-xs mb-3 text-center">Desconto especial por tempo limitado</p>
            
            <div className="bg-orange-600 text-white px-3 py-2 rounded-lg mb-4">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-3 h-3" />
                <span className="font-mono text-sm">
                  TEMPO RESTANTE: {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <Button 
              onClick={() => {
                trackEvent("unlock_report_clicked", { timeRemaining: timeLeft });
                onPurchase();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-xl uppercase tracking-wide"
            >
              DESBLOQUEAR RELATÓRIO AGORA
            </Button>

            {/* Elementos de confiança */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-center mb-3">
                <Lock className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-xs font-medium">SITE SEGURO</span>
                <span className="inline-block mx-2 text-gray-600">|</span>
                <Shield className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-xs font-medium">PAGAMENTO CRIPTOGRAFADO</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1 bg-blue-900/30 p-2 rounded">
                  <Info className="w-3 h-3 text-blue-400" />
                  <a href="#" className="text-blue-400 underline">Política de Privacidade</a>
                </div>
                <div className="flex items-center space-x-1 bg-blue-900/30 p-2 rounded">
                  <CreditCard className="w-3 h-3 text-blue-400" />
                  <span className="text-white">Múltiplas formas de pagamento</span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-900/30 p-2 rounded">
                  <Badge className="w-3 h-3 text-blue-400" />
                  <span className="text-white">Suporte 24h</span>
                </div>
              </div>
              
              {/* Garantia Reversa */}
              <div className="mt-4 border-2 border-green-500 rounded-lg p-4 bg-gradient-to-r from-green-900/30 to-black">
                <div className="flex items-center justify-between">
                  <Shield className="w-8 h-8 text-green-400" />
                  <h4 className="text-green-400 font-bold text-center flex-1">🛡️ GARANTIA TOTAL</h4>
                </div>
                <p className="text-white text-center my-2 leading-relaxed">
                  "Se você não ficar 100% satisfeito com as<br/>
                  informações descobertas, devolvemos seu<br/>
                  dinheiro + R$ 10 pelo tempo perdido."
                </p>
                <div className="w-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-400 text-xs font-medium">GARANTIA EXCLUSIVA 100% DE RISCO ZERO</span>
                </div>
              </div>
              
              {/* Bônus: Manual do Detetive Digital */}
              <div className="mt-6 bg-gradient-to-r from-yellow-800/30 to-yellow-600/30 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg mr-2">🎁</span>
                    <h3 className="text-yellow-400 font-bold">SEU GRÁTIS HOJE</h3>
                  </div>
                  <div>
                    <span className="text-red-400 text-xs line-through mr-1">R$ 97,00</span>
                    <Badge className="bg-red-600 text-white border-0 text-xs">VALOR R$ 0,00</Badge>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src="https://laisevip.com/wp-content/uploads/2025/06/DuKmOt5BQoKI9ZVcnHcjgw.webp" 
                      alt="Manual do Detetive Digital" 
                      onError={(e) => { 
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = 'none'; 
                        // Garantir que o próximo elemento é seguro para manipular
                        const nextElement = imgElement.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }} 
                      className="w-20 h-28 object-cover rounded border border-yellow-500" 
                    />
                    <div 
                      className="w-20 h-28 hidden items-center justify-center bg-black border border-yellow-500 rounded text-yellow-500 text-xs font-bold text-center">
                      📚 MANUAL DO DETETIVE DIGITAL
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">"MANUAL DO DETETIVE DIGITAL"</h4>
                    <ul className="space-y-1">
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>47 páginas de técnicas profissionais</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Como investigar qualquer pessoa em 15 min</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Ferramentas secretas que detetives usam</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Checklist de 50 sinais de traição</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Scripts prontos para confrontação</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Bônus: PROTOCOLO CONFISSÃO GARANTIDA */}
              <div className="mt-6 bg-gradient-to-r from-yellow-800/30 to-yellow-600/30 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg mr-2">🎯</span>
                    <h3 className="text-yellow-400 font-bold">BÔNUS ESPECIAL</h3>
                  </div>
                  <div>
                    <span className="text-red-400 text-xs line-through mr-1">R$ 97,00</span>
                    <Badge className="bg-red-600 text-white border-0 text-xs">VALOR R$ 0,00</Badge>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src="https://laisevip.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-18-at-12.38.19-PM.jpeg" 
                      alt="Protocolo Confissão Garantida" 
                      onError={(e) => { 
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = 'none'; 
                        // Garantir que o próximo elemento é seguro para manipular
                        const nextElement = imgElement.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }} 
                      className="w-20 h-28 object-cover rounded border border-yellow-500" 
                    />
                    <div 
                      className="w-20 h-28 hidden items-center justify-center bg-black border border-yellow-500 rounded text-yellow-500 text-xs font-bold text-center">
                      PROTOCOLO CONFISSÃO
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">"PROTOCOLO CONFISSÃO GARANTIDA"</h4>
                    <div className="mb-2">
                      <Badge className="bg-green-600 text-white border-0 text-xs mb-2">💰 VALOR: R$ 97,00 - SEU GRÁTIS HOJE</Badge>
                    </div>
                    <ul className="space-y-1">
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>15 Scripts de confrontação inteligente</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Técnicas de linguagem corporal reveladora</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Frases que quebram qualquer resistência</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Método "Confissão em 5 Minutos"</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Como abordar sem parecer paranoico</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Estratégias para diferentes personalidades</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Guia de primeiros socorros emocionais</span>
                      </li>
                    </ul>
                    <p className="text-gray-300 text-xs mt-2 italic">💡 "O mesmo método que terapeutas e detetives usam para extrair a verdade"</p>
                  </div>
                </div>
              </div>
              
              {/* Bônus: GUIA JURÍDICO COMPLETO */}
              <div className="mt-6 bg-gradient-to-r from-yellow-800/30 to-yellow-600/30 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg mr-2">🛡️</span>
                    <h3 className="text-yellow-400 font-bold">BÔNUS SURPRESA2: GUIA JURÍDICO COMPLETO</h3>
                  </div>
                  <div>
                    <span className="text-red-400 text-xs line-through mr-1">R$ 197,00</span>
                    <Badge className="bg-red-600 text-white border-0 text-xs">VALOR R$ 0,00</Badge>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src="https://laisevip.com/wp-content/uploads/2025/06/a-dramatic-ebook-cover-design-featuring-_0_mtFuKFQy-CTkgidqX86g_8IjetOeFRa2Zl7rVhUBY5g.png" 
                      alt="Guia Jurídico Completo" 
                      onError={(e) => { 
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = 'none'; 
                        // Garantir que o próximo elemento é seguro para manipular
                        const nextElement = imgElement.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }} 
                      className="w-20 h-28 object-cover rounded border border-yellow-500" 
                    />
                    <div 
                      className="w-20 h-28 hidden items-center justify-center bg-black border border-yellow-500 rounded text-yellow-500 text-xs font-bold text-center">
                      GUIA JURÍDICO
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <div className="text-gray-300 text-xs">💰 VALOR DE UMA CONSULTA ADVOCATÍCIA: R$ 300-500</div>
                      <div className="text-gray-300 text-xs">💰 VALOR DESTE GUIA COMPLETO: R$ 197,00</div>
                      <Badge className="bg-green-600 text-white border-0 text-xs mt-1">🎁 SEU BÔNUS GRÁTIS HOJE!</Badge>
                    </div>
                    <ul className="space-y-1 mt-2">
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>47 páginas de orientação especializada</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Templates jurídicos prontos (R$ 97)</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Rede de contatos especializados (R$ 147)</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Vídeo-aulas complementares (R$ 67)</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Suporte jurídico básico por 30 dias</span>
                      </li>
                    </ul>
                    <p className="text-gray-300 text-xs mt-2 font-bold">TOTAL: R$ 508,00 - SEU GRÁTIS!</p>
                  </div>
                </div>
              </div>
              
              {/* Bônus: INVESTIGAÇÃO EXTRA */}
              <div className="mt-6 bg-gradient-to-r from-yellow-800/30 to-yellow-600/30 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg mr-2">🔍</span>
                    <h3 className="text-yellow-400 font-bold">BÔNUS SURPRESA3: INVESTIGAÇÃO EXTRA</h3>
                  </div>
                  <div>
                    <span className="text-red-400 text-xs line-through mr-1">R$ 47,00</span>
                    <Badge className="bg-red-600 text-white border-0 text-xs">VALOR R$ 0,00</Badge>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src="https://laisevip.com/wp-content/uploads/2025/06/pmAGTtKuQIWqIViXyH2oEg.webp" 
                      alt="Investigação Extra" 
                      onError={(e) => { 
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = 'none'; 
                        // Garantir que o próximo elemento é seguro para manipular
                        const nextElement = imgElement.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }} 
                      className="w-20 h-28 object-cover rounded border border-yellow-500" 
                    />
                    <div 
                      className="w-20 h-28 hidden items-center justify-center bg-black border border-yellow-500 rounded text-yellow-500 text-xs font-bold text-center">
                      INVESTIGAÇÃO EXTRA
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <div className="text-gray-300 text-xs">💰 VALOR: R$ 47,00</div>
                      <Badge className="bg-green-600 text-white border-0 text-xs mt-1">🎁 APENAS NAS PRÓXIMAS 2 HORAS</Badge>
                    </div>
                    <h4 className="text-white font-bold mt-2 mb-1">🔍 "SEGUNDO RELATÓRIO GRÁTIS"</h4>
                    <ul className="space-y-1">
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Investigue outra pessoa de graça</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Válido por 30 dias</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Mesmo nível de detalhamento</span>
                      </li>
                      <li className="text-gray-300 text-xs flex items-start">
                        <CheckCircle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Perfeito para confirmar suspeitas</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-6 mb-4">
                <button 
                  onClick={onPurchase}
                  className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg animate-pulse transform transition-transform hover:scale-105 flex items-center justify-center w-full max-w-md"
                >
                  <span className="mr-2">➤</span>
                  VER RELATÓRIO AGORA
                  <span className="ml-2">➤</span>
                </button>
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
