import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Copy, CheckCircle } from 'lucide-react';
import { usePixApi } from '@/hooks/usePixApi';

interface CheckoutPageProps {
  userData: {
    phone: string;
    gender: string;
  };
  onSuccess: () => void;
}

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
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (transactionId && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        const status = await verifyPayment(transactionId);
        if (status && status.ok && status.status === 'completed') {
          setPaymentStatus('completed');
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
      return;
    }

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
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (paymentStatus === 'completed') {
    return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-tinder-dark">
        <Card className="w-full max-w-md bg-tinder-dark border-gray-700 text-white">
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
      </div>;
  }

  return <div className="min-h-screen p-4 bg-gradient-tinder-dark">
      <div className="w-full max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Relatório do Tinder */}
          <Card className="bg-tinder-dark border-gray-700">
            <CardContent className="p-4 text-center">
              <h3 className="text-pink-400 font-bold text-lg mb-2">Relatório do Tinder</h3>
              <div className="text-2xl font-bold text-white mb-1">R$ 19,90</div>
              <p className="text-gray-300 text-sm">Desconto especial por tempo limitado</p>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center text-sm text-white">
                  <Shield className="w-4 h-4 mr-2 text-green-400" />
                  <span>Pagamento Seguro</span>
                </div>
                <div className="flex items-center text-sm text-white">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  <span>100% Anônimo</span>
                </div>
                <div className="flex items-center text-sm text-white">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  <span>Acesso Imediato</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Pagamento */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-green-500 rounded mr-2"></div>
                <span className="font-semibold">Informações de Pagamento</span>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
                <div className="border-2 border-pink-500 rounded-lg p-2 flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="font-medium">PIX - Pagamento Instantâneo</span>
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded">
                
                <p className="text-center text-sm">
                  Preencha seu e-mail e clique em "Gerar PIX" para continuar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {!showPix ? <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Informações de Cobrança</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail *</label>
                  <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
                </div>

                <p className="text-xs text-gray-600">
                  Precisamos apenas do seu e-mail para enviar o acesso de forma segura e anônima
                </p>

                <Button onClick={handleGeneratePix} disabled={!email || isLoading} className="w-full bg-gradient-tinder text-white font-bold py-3 rounded-full">
                  {isLoading ? 'Gerando PIX...' : '💳 Gerar PIX - R$ 19,90'}
                </Button>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Pagamento 100% seguro e criptografado</span>
                  </div>
                </div>
                
                <div className="text-center text-xs text-gray-500">
                  Seus dados estão protegidos por SSL de 256 bits
                </div>
              </div>
            </CardContent>
          </Card> : <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">PIX Gerado com Sucesso!</h3>
              
              {/* QR Code */}
              <div className="text-center mb-4">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`} alt="QR Code PIX" className="mx-auto mb-2 border rounded-lg" />
                <p className="text-sm text-gray-600">
                  Escaneie o QR Code com seu app do banco
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Ou copie o código PIX abaixo:
                </p>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs break-all font-mono">{pixCode}</p>
                </div>
                
                <Button onClick={copyPixCode} className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copiado!' : 'Copiar Código PIX'}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Aguardando pagamento...
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Verificando pagamento automaticamente</span>
                </div>
              </div>
            </CardContent>
          </Card>}

        <Card className="bg-tinder-dark border-gray-700 mt-4">
          <CardContent className="p-4">
            <h4 className="text-white font-semibold mb-2 text-center">
              ⭐ O que nossos clientes dizem
            </h4>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                {'⭐'.repeat(5)}
              </div>
              <p className="text-gray-300 text-sm italic">
                "Descobri que meu namorado estava ativo no Tinder há 3 meses. O Tinder Espião me mostrou tudo: fotos, conversas e horários. Foi difícil de aceitar, mas preferi saber a verdade."
              </p>
              <p className="text-pink-400 text-xs mt-2 font-medium">Carla M.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default CheckoutPage;
