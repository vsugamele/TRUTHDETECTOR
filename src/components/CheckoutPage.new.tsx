import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Copy, CheckCircle, Clock, MapPin, AlertCircle, Eye, Lock, MessageCircle, Users, BarChart, List, CreditCard, Info } from 'lucide-react';
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
      console.log(`\u2705 Clarity event tracked: ${eventName}`, eventData);
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
  
  const {
    generatePix,
    verifyPayment,
    isLoading,
    error
  } = usePixApi();

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
        
        {/* Aviso de tempo limitado */}
        <div className="border border-orange-500 bg-orange-900/50 text-white px-4 py-3 text-center font-medium rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-orange-400 mr-2" />
          <span className="text-sm">ATENÇÃO: Este relatório será deletado automaticamente em 24 horas por questões de privacidade.</span>
        </div>

        {!showPix ? (
          <Card className="bg-black border border-blue-700">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 text-center text-blue-400">Relatório do Tinder</h3>
              
              <div className="text-center mb-4">
                <div className="text-xs text-orange-400 mb-1">Preço normal:</div>
                <div className="line-through text-gray-400 text-sm">R$ 67,00</div>
                <div className="text-xs text-orange-400 mt-2">🔥 HOJE APENAS:</div>
                <div className="text-green-500 text-2xl font-bold">R$ 19,90</div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-400 mb-1">E-mail *</label>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-blue-900/20 border-blue-800 text-white" 
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Precisamos apenas do seu e-mail para enviar o acesso de forma segura e anônima
                </p>

                <Button 
                  onClick={handleGeneratePix} 
                  disabled={!email || isLoading} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-lg uppercase tracking-wide"
                >
                  {isLoading ? 'Gerando PIX...' : 'GARANTIR ACESSO AGORA - R$ 19,90'}
                </Button>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex items-center justify-center mt-2 text-xs text-green-400">
                  <Lock className="w-3 h-3 mr-1" />
                  <span>Pagamento 100% seguro</span>
                </div>
                
                <div className="text-center text-xs text-green-400 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>Acesso imediato após pagamento</span>
                </div>
              </div>
              
              {/* Teaser Irresistível */}
              <div className="mt-6 pt-4 border-t border-blue-900">
                <h4 className="text-center font-bold text-white mb-3">
                  <Eye className="inline-block w-4 h-4 mr-1 text-blue-400" />
                  O QUE VOCÊ VAI VER NO RELATÓRIO:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">🟨</span>
                    <span className="text-gray-300">Localização exata nos últimos 7 dias</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">🟨</span>
                    <span className="text-gray-300">Atividade em redes sociais ocultas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">🟨</span>
                    <span className="text-gray-300">Mensagens enviadas em horários suspeitos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">🟨</span>
                    <span className="text-gray-300">Perfis ativos que você desconhece</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">🟨</span>
                    <span className="text-gray-300">Padrões de comportamento analisados por IA</span>
                  </li>
                  <li className="flex items-start mt-2">
                    <span className="text-green-500 font-semibold text-xs w-full text-center">+ 15 outros dados que vão chocar você</span>
                  </li>
                </ul>
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

        {/* Depoimentos */}
        <Card className="bg-black border border-blue-700 mt-4">
          <CardContent className="p-4">
            <h4 className="text-blue-400 font-semibold mb-2 text-center">
              ⭐ O que nossos clientes dizem
            </h4>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                {'⭐'.repeat(5)}
              </div>
              <p className="text-gray-300 text-sm italic">
                "Descobri que meu namorado estava ativo no Tinder há 3 meses. O Tinder Espião me mostrou tudo: fotos, conversas e horários. Foi difícil de aceitar, mas preferi saber a verdade."
              </p>
              <p className="text-blue-400 text-xs mt-2 font-medium">Carla M.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
