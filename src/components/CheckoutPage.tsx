import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Copy, CheckCircle, Clock, MapPin, AlertCircle, Eye, Lock, 
  MessageCircle, Users, BarChart, List, CreditCard, Info, Award, Star, 
  Timer, ShieldCheck, CreditCard as CreditCardIcon, Heart, ThumbsUp, Zap, 
  Search, Mail, Target, Check, Gift, X, Loader2, AlertTriangle, DollarSign 
} from 'lucide-react';
import { usePixApi } from '@/hooks/usePixApi';
import "./highlight.css";

interface CheckoutPageProps {
  userData: {
    phone: string;
    gender: string;
    profilePhoto?: string;
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
  
  // Estado para os order bumps (ofertas adicionais)
  const [orderBumps, setOrderBumps] = useState({
    acessoVitalicio: false,  // Acesso vitalício ao aplicativo — R$ 19,00
    rastreioGPS: false,      // Rastreie a localização da pessoa desejada 24 horas por dia via GPS — R$ 9,00
    historicoWeb: false       // Links compartilhados e excluídos, histórico de navegação, logins e muito mais — R$ 9,00
  });
  
  // Referência para a seção de email para scroll
  const emailSectionRef = useRef<HTMLDivElement>(null);
  
  // Função para calcular o valor total com as ofertas adicionais selecionadas
  const calculateTotalAmount = () => {
    let baseAmount = 1990; // R$ 19,90 em centavos
    
    // Adicionar valores das ofertas selecionadas
    if (orderBumps.acessoVitalicio) baseAmount += 1900; // R$ 19,00
    if (orderBumps.rastreioGPS) baseAmount += 900;      // R$ 9,00
    if (orderBumps.historicoWeb) baseAmount += 900;     // R$ 9,00
    
    return baseAmount;
  };
  
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
    // Usar um email válido para o processamento, mesmo que o campo esteja vazio
    const emailToUse = email || "cliente@tinder-checker.com";
    
    if (!email) {
      // Rastreamos o evento e atualizamos o campo de email visualmente
      trackEvent("generate_pix_without_email");
      // Definir um email padrão para continuar o fluxo (só para atualizar a UI)
      setEmail(emailToUse);
    }
    
    const totalAmount = calculateTotalAmount();
    const selectedOffers = [];
    
    // Construir a descrição com as ofertas selecionadas
    if (orderBumps.acessoVitalicio) selectedOffers.push("Acesso vitalício");
    if (orderBumps.rastreioGPS) selectedOffers.push("Rastreio GPS");
    if (orderBumps.historicoWeb) selectedOffers.push("Histórico web");
    
    // Criar descrição base com as ofertas adicionais
    let description = "Relatório TinderChecker";
    if (selectedOffers.length > 0) {
      description += " + " + selectedOffers.join(", ");
    }
    
    // Rastrear início da geração do PIX com detalhes das ofertas
    trackEvent("generate_pix_started", { 
      email: emailToUse,
      totalAmount: totalAmount,
      orderBumps: orderBumps,
      selectedOffers: selectedOffers
    });
    
    const paymentData = {
      amount: totalAmount,
      description: description,
      customer: {
        name: emailToUse.split('@')[0],
        document: "00000000000",
        phone: userData.phone,
        email: emailToUse
      },
      item: {
        title: "Relatório TinderChecker",
        price: totalAmount,
        quantity: 1
      },
      utm: utmParams || "tinder-checker"
    };

    try {
      const response = await generatePix(paymentData);
      if (response) {
        setShowPix(true);
        setPixCode(response.pixCode);
        setTransactionId(response.transactionId);
        
        // Rastrear geração de PIX bem-sucedida
        trackEvent("pix_generated_success", { 
          transactionId: response.transactionId.substring(0, 8) + '...', 
          amount: totalAmount,
          selectedOffers: selectedOffers,
          email: email.substring(0, 3) + '...'
        });
      }
    } catch (err) {
      console.error("Erro ao gerar PIX:", err);
      
      // Rastrear erro na geração do PIX
      trackEvent("pix_generated_error", { error: err instanceof Error ? err.message : String(err) });
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
        
        {/* A barra de escassez foi removida */}

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
                <div id="email-section">
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
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Zap className="w-3 h-3 text-green-400 mr-1" />
                    <p className="text-xs text-gray-300">Relatório chega em 30 segundos após pagamento</p>
                  </div>
                </div>

                {/* Order Bumps - Ofertas Adicionais */}
                <div className="mt-6 mb-4 space-y-3">
                  <div className="text-center">
                    <h4 className="text-yellow-400 font-bold text-lg">OFERTAS ESPECIAIS</h4>
                    <p className="text-gray-300 text-xs">Disponíveis apenas para novos usuários</p>
                  </div>
                  
                  {/* Oferta 1: Acesso vitalício */}
                  <div className="border border-yellow-600 rounded-lg overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="bg-yellow-600 text-black text-xs font-bold py-1 px-2 text-center">
                      OFERTA LIMITADA
                    </div>
                    <div className="p-3">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="orderBump1"
                          className="mt-1 h-5 w-5 accent-yellow-500"
                          checked={orderBumps.acessoVitalicio}
                          onChange={(e) => {
                            setOrderBumps(prev => ({...prev, acessoVitalicio: e.target.checked}));
                            trackEvent("order_bump_toggle", { name: "acesso_vitalicio", selected: e.target.checked });
                          }}
                        />
                        <label htmlFor="orderBump1" className="ml-2 cursor-pointer flex-1">
                          <div className="font-semibold text-white">Acesso vitalício ao aplicativo</div>
                          <div className="text-yellow-400 font-bold mt-1">+ R$ 19,00</div>
                          <div className="text-xs text-gray-400 mt-1">✓ Sim, eu quero adicionar esta oferta.</div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Oferta 2: Rastreio GPS */}
                  <div className="border border-yellow-600 rounded-lg overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="bg-yellow-600 text-black text-xs font-bold py-1 px-2 text-center">
                      OFERTA LIMITADA
                    </div>
                    <div className="p-3">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="orderBump2"
                          className="mt-1 h-5 w-5 accent-yellow-500"
                          checked={orderBumps.rastreioGPS}
                          onChange={(e) => {
                            setOrderBumps(prev => ({...prev, rastreioGPS: e.target.checked}));
                            trackEvent("order_bump_toggle", { name: "rastreio_gps", selected: e.target.checked });
                          }}
                        />
                        <label htmlFor="orderBump2" className="ml-2 cursor-pointer flex-1">
                          <div className="font-semibold text-white">Rastreie a localização da pessoa desejada 24 horas por dia via GPS</div>
                          <div className="text-yellow-400 font-bold mt-1">+ R$ 9,00</div>
                          <div className="text-xs text-gray-400 mt-1">✓ Sim, eu quero adicionar esta oferta.</div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Oferta 3: Histórico Web */}
                  <div className="border border-yellow-600 rounded-lg overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="bg-yellow-600 text-black text-xs font-bold py-1 px-2 text-center">
                      OFERTA LIMITADA
                    </div>
                    <div className="p-3">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="orderBump3"
                          className="mt-1 h-5 w-5 accent-yellow-500"
                          checked={orderBumps.historicoWeb}
                          onChange={(e) => {
                            setOrderBumps(prev => ({...prev, historicoWeb: e.target.checked}));
                            trackEvent("order_bump_toggle", { name: "historico_web", selected: e.target.checked });
                          }}
                        />
                        <label htmlFor="orderBump3" className="ml-2 cursor-pointer flex-1">
                          <div className="font-semibold text-white">Links compartilhados e excluídos, histórico de navegação, logins e muito mais</div>
                          <div className="text-yellow-400 font-bold mt-1">+ R$ 9,00</div>
                          <div className="text-xs text-gray-400 mt-1">✓ Sim, eu quero adicionar esta oferta.</div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Resumo do pedido */}
                <div className="mb-4 p-3 bg-gray-800/50 border border-blue-700/30 rounded-lg">
                  <h3 className="text-center text-white font-bold mb-2">Resumo do Pedido</h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Relatório Completo</span>
                      <span className="text-white">R$ 19,90</span>
                    </div>
                    
                    {orderBumps.acessoVitalicio && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Acesso Vitalício</span>
                        <span className="text-white">R$ 19,00</span>
                      </div>
                    )}
                    
                    {orderBumps.rastreioGPS && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Rastreio GPS</span>
                        <span className="text-white">R$ 9,00</span>
                      </div>
                    )}
                    
                    {orderBumps.historicoWeb && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Histórico Web</span>
                        <span className="text-white">R$ 9,00</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-green-500">R$ {(calculateTotalAmount() / 100).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGeneratePix} 
                  disabled={isLoading} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-sm uppercase tracking-wide transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>🔥 DESCOBRIR A VERDADE AGORA<br /><span className="text-yellow-200">R$ {(calculateTotalAmount() / 100).toFixed(2).replace('.', ',')}</span></>
                  )}
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
              {/* Item 5 */}
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-white">Proteção total: seus dados nunca são expostos</span>
              </div>
            </div>

            
            <div className="flex justify-center mt-6 mb-4">
              <button 
                onClick={handleGeneratePix}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg animate-pulse transform transition-transform hover:scale-105 flex items-center justify-center w-full max-w-md"
              >
                <span className="mr-2">➤</span>
                VER RELATÓRIO AGORA
                <span className="ml-2">➤</span>
              </button>
            </div>
            
            <div className="flex justify-center mt-3">
              <div className="bg-green-900/40 border border-green-700 rounded px-3 py-1 text-green-500 font-bold">
                100% RISCO ZERO
              </div>
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
