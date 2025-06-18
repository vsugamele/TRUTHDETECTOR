import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Copy, CheckCircle, Clock, MapPin, AlertCircle, Eye, Lock, MessageCircle, Users, BarChart, List, CreditCard, Info, Award, Star, Timer, ShieldCheck, CreditCard as CreditCardIcon, Heart, ThumbsUp, Zap, Search, Mail, Target, Check, Gift, X } from 'lucide-react';
import { usePixApi } from '@/hooks/usePixApi';

interface CheckoutPageProps {
  userData: {
    phone: string;
    gender: string;
  };
  onSuccess: () => void;
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

const CheckoutPage = ({
  userData,
  onSuccess
}: CheckoutPageProps) => {
  const [email, setEmail] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showPix, setShowPix] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed'>('pending');
  const [copied, setCopied] = useState(false);
  const [utmParams, setUtmParams] = useState('');
  // contador regressivo e vagas restantes
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 12 });
  const [remainingSlots, setRemainingSlots] = useState(23);
  const [showExitPopup, setShowExitPopup] = useState(false);
  
  const {
    generatePix,
    verifyPayment,
    isLoading,
    error
  } = usePixApi();

  // Estado para o contador de tempo
  // Capture URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramString = urlParams.toString();
    setUtmParams(paramString);
    console.log('URL parameters captured:', paramString);
    
    // Rastrear evento de visualização da página de checkout
    trackEvent("checkout_page_viewed", {
      hasUtmParams: !!paramString,
      phone: userData.phone,
      gender: userData.gender
    });
    
    // Iniciar o contador regressivo
    const timer = setInterval(() => {
      setCountdown(prev => {
        let newHours = prev.hours;
        let newMinutes = prev.minutes;
        let newSeconds = prev.seconds - 1;
        
        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        
        if (newHours < 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);
    
    // Gerar um valor aleatório para vagas restantes entre 15 e 27
    setRemainingSlots(Math.floor(Math.random() * (27 - 15 + 1) + 15));
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (transactionId && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        const status = await verifyPayment(transactionId);
        if (status && status.ok && status.status === 'completed') {
          setPaymentStatus('completed');
          
          // Rastrear pagamento confirmado
          trackEvent("payment_confirmed", { 
            transactionId: transactionId.substring(0, 8) + '...',
            timeToPayment: new Date().toISOString()
          });
          
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [transactionId, paymentStatus, verifyPayment, onSuccess]);

  useEffect(() => {
    if (!showPix && !showExitPopup) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 20) {
          setShowExitPopup(true);
          trackEvent("exit_intent_shown", {});
        }
      };
      
      document.addEventListener('mouseleave', handleMouseLeave);
      
      // Também mostra após 40 segundos na página se não fez a compra
      const exitTimer = setTimeout(() => {
        if (!showPix && !showExitPopup) {
          setShowExitPopup(true);
          trackEvent("exit_popup_timer_shown", {});
        }
      }, 40000);
      
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(exitTimer);
      };
    }
  }, [showPix, showExitPopup]);

  const handleGeneratePix = async () => {
    if (!email) {
      // Rastrear tentativa de gerar PIX sem e-mail
      trackEvent("generate_pix_without_email");
      return;
    }
    
    // Rastrear início da geração de PIX
    trackEvent("generate_pix_started", { email: email.split('@')[1] });

    const paymentData = {
      amount: 1990,
      description: "Relatório do Tinder",
      customer: {
        name: "Cliente Tinder",
        document: "00000000000",
        phone: userData.phone,
        email
      },
      item: {
        title: "Relatório Completo do Tinder",
        price: 1990,
        quantity: 1
      },
      utm: utmParams || "tinder-checker"
    };

    console.log('Generating PIX with UTM params:', utmParams);
    const response = await generatePix(paymentData);
    if (response) {
      setPixCode(response.pixCode);
      setTransactionId(response.transactionId);
      setShowPix(true);
      
      // Rastrear PIX gerado com sucesso
      trackEvent("pix_generated_success", {
        transactionId: response.transactionId.substring(0, 8) + '...',
        amount: paymentData.amount
      });
    } else {
      // Rastrear erro na geração de PIX
      trackEvent("pix_generation_failed", { hasError: !!error });
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Rastrear cópia do código PIX
    trackEvent("pix_code_copied", { codeLength: pixCode.length });
  };

  if (paymentStatus === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <Card className="w-full max-w-md bg-black border border-blue-700 text-white">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Pagamento Confirmado!</h2>
            <p className="text-gray-300 mb-4">
              Seu relatório está sendo preparado...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-black">
      <div className="w-full max-w-md mx-auto space-y-4">
        
        {/* Header de Urgência Devastador */}
        <div className="border-2 border-red-500 bg-black text-white p-4 text-center font-bold rounded-lg">
          <div className="text-red-500 text-lg mb-2 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>ÚLTIMAS HORAS DE ACESSO LIBERADO</span>
          </div>
          
          <div className="text-gray-300 text-sm mb-2">Este relatório expira em:</div>
          
          {/* Contador regressivo */}
          <div className="flex items-center justify-center mb-2 text-white">
            <div className="bg-red-900 px-2 py-1 rounded mr-1 w-12 text-center">
              {String(countdown.hours).padStart(2, '0')}
            </div>
            <span className="mx-1">:</span>
            <div className="bg-red-900 px-2 py-1 rounded mr-1 w-12 text-center">
              {String(countdown.minutes).padStart(2, '0')}
            </div>
            <span className="mx-1">:</span>
            <div className="bg-red-900 px-2 py-1 rounded w-12 text-center">
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex items-center justify-center text-yellow-400 text-sm">
            <Clock className="w-4 h-4 animate-pulse mr-1" />
            <span>CONTANDO AGORA</span>
          </div>
          
          <div className="mt-2 text-gray-300">
            Após isso: <span className="text-white font-medium">R$ 97,00</span> (preço normal)
          </div>
        </div>
        
        {/* Barra de escassez */}
        <div className="bg-black border border-orange-500 p-3 rounded-lg text-white text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="w-4 h-4 text-orange-400 mr-1" />
            <span className="text-sm font-medium">VAGAS LIMITADAS HOJE:</span>
          </div>
          
          <Progress value={(127/150)*100} className="h-3 mb-1" />
          
          <div className="text-xs text-orange-400">
            127 de 150 relatórios vendidos
          </div>
          
          <div className="mt-1 text-yellow-400 text-xs flex items-center justify-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span>Restam apenas {remainingSlots} acessos com desconto</span>
          </div>
        </div>

        {!showPix ? (
          <Card className="bg-black border border-blue-700">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-3 text-blue-400">RELATÓRIO COMPLETO DE INVESTIGAÇÃO DIGITAL</h3>
              
              <div className="text-center mb-4 bg-black/40 p-3 rounded-lg border border-blue-900">
                <div className="flex items-center justify-center text-sm text-orange-400 mb-2">
                  <CreditCardIcon className="w-4 h-4 mr-1" />
                  <span>Valor Real:</span>
                </div>
                <div className="line-through text-gray-400 font-medium">R$ 297,00</div>
                <div className="text-xs text-gray-300 mt-1">(Preço de um detetive particular)</div>
                
                <div className="mt-3 flex items-center justify-center text-yellow-400 font-bold text-sm">
                  <Zap className="w-4 h-4 mr-1" />
                  <span>LIBERAÇÃO ESPECIAL:</span>
                </div>
                <div className="text-green-500 text-3xl font-bold animate-pulse">R$ 19,90</div>
                <div className="mt-1 text-xs text-green-400">(93% de desconto - HOJE APENAS)</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-blue-400 mb-1">
                    <Mail className="w-4 h-4 mr-1" />
                    <label className="block text-sm font-medium">ONDE ENVIAR SEU RELATÓRIO CONFIDENCIAL:</label>
                  </div>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-blue-900/20 border-blue-800 text-white" 
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-center">
                    <Lock className="w-3 h-3 text-green-400 mr-1" />
                    <p className="text-xs text-gray-300">
                      Seus dados são criptografados e nunca compartilhados.
                      <span className="text-blue-400 underline ml-1 cursor-pointer">Política de privacidade</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Zap className="w-3 h-3 text-green-400 mr-1" />
                    <p className="text-xs text-gray-300">Relatório chega em 30 segundos após pagamento</p>
                  </div>
                </div>

                <Button 
                  onClick={handleGeneratePix} 
                  disabled={!email || isLoading} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-lg uppercase tracking-wide scale-105 transition-all duration-300 animate-pulse"
                >
                  {isLoading ? 'Gerando PIX...' : '🔥 DESCOBRIR A VERDADE AGORA - R$ 19,90'}
                </Button>
                
                <div className="text-center text-xs text-gray-300 -mt-1">
                  └─ Acesso instantâneo • 100% seguro
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="bg-black/40 p-3 mt-3 rounded-lg border border-green-900">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-xs text-green-400">Pagamento 100% seguro (SSL 256-bit)</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-xs text-green-400">Acesso imediato após confirmação</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-xs text-green-400">Suporte 24h via WhatsApp</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-xs text-green-400">Mais de 47.000 relatórios entregues</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-xs text-green-400">Nota 4.9/5 no Reclame Aqui</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lista de Benefícios Explosiva */}
              <div className="mt-6 pt-4 border-t border-blue-900">
                <h4 className="text-center font-bold text-white mb-3">
                  <Target className="inline-block w-5 h-5 mr-1 text-orange-500" />
                  O QUE VOCÊ VAI DESCOBRIR:
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-blue-950/30 p-2 rounded">
                    <div className="flex items-start">
                      <div className="bg-orange-600/20 p-1 rounded mr-2">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Localização GPS exata (últimos 15 dias)</div>
                        <div className="text-gray-400 text-xs ml-3">
                          └─ Inclusive locais "deletados" do histórico
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/30 p-2 rounded">
                    <div className="flex items-start">
                      <div className="bg-orange-600/20 p-1 rounded mr-2">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Atividade secreta em 12+ redes sociais</div>
                        <div className="text-gray-400 text-xs ml-3">
                          └─ Instagram, TikTok, Snapchat, Discord...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/30 p-2 rounded">
                    <div className="flex items-start">
                      <div className="bg-orange-600/20 p-1 rounded mr-2">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Mensagens apagadas recuperadas</div>
                        <div className="text-gray-400 text-xs ml-3">
                          └─ WhatsApp, Telegram, Signal
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/30 p-2 rounded">
                    <div className="flex items-start">
                      <div className="bg-orange-600/20 p-1 rounded mr-2">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Perfis ocultos em apps de relacionamento</div>
                        <div className="text-gray-400 text-xs ml-3">
                          └─ Tinder, Bumble, Happn, Badoo
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/30 p-2 rounded">
                    <div className="flex items-start">
                      <div className="bg-orange-600/20 p-1 rounded mr-2">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Análise comportamental por IA</div>
                        <div className="text-gray-400 text-xs ml-3">
                          └─ Padrões de traição identificados
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/30 p-2 rounded">
                    <div className="flex items-start">
                      <div className="bg-orange-600/20 p-1 rounded mr-2">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Relatório fotográfico completo</div>
                        <div className="text-gray-400 text-xs ml-3">
                          └─ Screenshots de todas as evidências
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-3">
                    <div className="text-yellow-400 font-bold text-sm animate-pulse">
                      + 23 OUTROS DADOS CONFIDENCIAIS
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-black border border-blue-700">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-blue-400">PIX Gerado com Sucesso!</h3>
              
              {/* QR Code */}
              <div className="text-center mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} 
                  alt="QR Code PIX" 
                  className="mx-auto mb-2 border rounded-lg" 
                />
                <p className="text-sm text-gray-400">
                  Escaneie o QR Code com seu app do banco
                </p>
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Ou copie o código PIX abaixo:
                </p>
                
                <div className="bg-black p-3 rounded border border-blue-900">
                  <p className="text-xs break-all font-mono text-gray-300">{pixCode}</p>
                </div>
                
                <Button 
                  onClick={copyPixCode} 
                  className="w-full mt-2 bg-green-600 hover:bg-green-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copiado!' : 'Copiar Código PIX'}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">
                  Aguardando pagamento...
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Verificando pagamento automaticamente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Garantia Suprema */}
        <Card className="bg-gradient-to-r from-green-950 to-black border border-green-700 mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-green-500 mr-2" />
              <h4 className="text-green-500 font-bold text-lg">GARANTIA BLINDADA 30 DIAS</h4>
            </div>
            
            <p className="text-gray-300 text-sm text-center mb-3">
              Se você não descobrir <span className="text-green-400 font-bold">PELO MENOS 3 informações</span> que não sabia sobre seu parceiro(a):
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <CreditCardIcon className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-white text-sm">Devolvemos R$ 19,90 + R$ 30 de compensação</span>
              </div>
              
              <div className="flex items-center">
                <Gift className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-white text-sm">Você fica com o relatório de graça</span>
              </div>
              
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-white text-sm">Reembolso em até 2 horas</span>
              </div>
            </div>
            
            <div className="flex justify-center mt-3">
              <div className="bg-green-900/40 border border-green-700 rounded px-3 py-1 text-green-500 font-bold">
                100% RISCO ZERO
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Depoimentos Expandidos */}
        <Card className="bg-black border border-blue-700 mt-4">
          <CardContent className="p-4">
            <h4 className="text-blue-400 font-semibold mb-2 text-center">
              ⭐⭐⭐⭐⭐ 4.9/5 (12.847 avaliações)
            </h4>
            
            <div className="space-y-3 mt-3">
              <div className="border-l-2 border-blue-500 pl-3">
                <p className="text-gray-300 text-sm italic">
                  "Descobri 3 perfis secretos que ele mantinha. Valeu cada centavo!"
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-blue-400 text-xs font-medium">Marina S.</p>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              
              <div className="border-l-2 border-blue-500 pl-3">
                <p className="text-gray-300 text-sm italic">
                  "Em 5 minutos soube mais que em 2 anos de relacionamento."
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-blue-400 text-xs font-medium">Carlos R.</p>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              
              <div className="border-l-2 border-blue-500 pl-3">
                <p className="text-gray-300 text-sm italic">
                  "Minha intuição estava certa. Obrigada por me dar coragem!"
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-blue-400 text-xs font-medium">Ana L.</p>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <Button variant="link" className="text-blue-500 text-xs">
                VER MAIS 2.341 DEPOIMENTOS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;

// CSS para animação bounce-once
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  @keyframes bounce-once {
    0% { transform: scale(0.8); opacity: 0; }
    70% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-bounce-once {
    animation: bounce-once 0.5s ease-out forwards;
  }
`;
document.head.appendChild(styleElement);
