import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, CheckCircle, AlertTriangle, Timer, Clock, 
  Check, Star, Gift, Copy, Loader2, QrCode, Mail, Lock
} from 'lucide-react';
import { usePixApi } from '@/hooks/usePixApi';

interface UpsellPageProps {
  onAccept: () => void;
  onDecline: () => void;
  userData: {
    phone: string;
    gender: string;
    name: string;
    age: string;
    email?: string;
    profilePhoto?: string;
  };
}

// Função auxiliar para registrar eventos
const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (window.clarity) {
    try {
      window.clarity("event", eventName, eventData);
      console.log(`✅ Clarity event tracked: ${eventName}`, eventData);
    } catch (err) {
      console.error("Error tracking event:", err);
    }
  }
};

const UpsellPage: React.FC<UpsellPageProps> = ({ onAccept, onDecline, userData }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  const [email, setEmail] = useState(userData.email || '');
  const [pixCode, setPixCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showPix, setShowPix] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed'>('pending');
  const [copied, setCopied] = useState(false);
  
  // Usar a API PIX
  const {
    generatePix,
    verifyPayment,
    isLoading,
    error
  } = usePixApi();
  
  // Timer para contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Rastrear visualização da página de upsell
    trackEvent("upsell_page_viewed", { 
      name: userData.name,
      gender: userData.gender
    });
    
    return () => clearInterval(timer);
  }, [userData]);
  
  // Verificar pagamento periodicamente
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (transactionId && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        const status = await verifyPayment(transactionId);
        if (status && status.ok && status.status === 'completed') {
          setPaymentStatus('completed');
          
          // Rastrear pagamento confirmado
          trackEvent("upsell_payment_confirmed", { 
            transactionId: transactionId.substring(0, 8) + '...',
            timeToPayment: new Date().toISOString()
          });
          
          setTimeout(() => {
            onAccept();
          }, 2000);
        }
      }, 5000);  // Verificar a cada 5 segundos
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [transactionId, paymentStatus, verifyPayment, onAccept]);
  
  // Função para gerar o PIX
  const handleGeneratePix = async () => {
    // Usar email fornecido ou gerar um temporário baseado no telefone
    const userEmail = email || `usuario${userData.phone.substring(userData.phone.length - 4)}@temp.com`;
    
    // Valor fixo de R$ 29,90 (em centavos)
    const amount = 2990;
    
    // Rastrear início da geração do PIX
    trackEvent("upsell_generate_pix_started", { 
      email: userEmail
    });
    
    const paymentData = {
      amount: amount,
      description: "Upgrade Premium - Histórico Completo",
      customer: {
        name: userEmail.split('@')[0],
        document: "00000000000",
        phone: userData.phone,
        email: userEmail
      },
      item: {
        title: "Histórico Completo 12 meses",
        price: amount,
        quantity: 1
      },
      utm: "upsell-page"
    };

    try {
      const response = await generatePix(paymentData);
      if (response) {
        setShowPix(true);
        setPixCode(response.pixCode);
        setTransactionId(response.transactionId);
        
        // Rastrear geração de PIX bem-sucedida
        trackEvent("upsell_pix_generated_success", { 
          transactionId: response.transactionId.substring(0, 8) + '...', 
          email: email.substring(0, 3) + '...'
        });
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
    }
  };
  
  // Função para copiar código PIX
  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    
    // Rastrear cópia do PIX
    trackEvent("upsell_pix_copied", {});
  };

  // Formatação do tempo restante
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-red-950 text-white">
      {/* Perfil Encontrado */}
      <div className="px-4 py-3 bg-black border-b border-red-900">
        <div className="flex items-center justify-center mb-4 mt-2">
          <div className="bg-green-700 text-white text-xl font-bold py-2 px-6 rounded-lg animate-pulse flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-white" />
            Perfil Encontrado!
          </div>
        </div>
        
        {userData.profilePhoto && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src={userData.profilePhoto} 
                alt="Perfil" 
                className="w-24 h-24 rounded-full border-2 border-green-500 object-cover" 
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-green-500">✓ Etapa 1 Concluída</span>
          <span className="text-green-500">✅ Etapa 2 em Andamento</span>
          <span className="text-gray-400">⭕ Etapa 3</span>
        </div>
        <Progress value={66} className="h-2 bg-gray-900" />
      </div>
      
      {/* Cabeçalho urgência */}
      <div className="bg-red-900 p-4 text-center animate-pulse">
        <h1 className="text-2xl font-bold">ESPERE! Não Feche Esta Página!</h1>
        <p className="text-lg">Seu acesso desbloqueou uma oportunidade exclusiva por apenas 15 minutos!</p>
      </div>
      
      {/* Nova headline sobre mensagens do WhatsApp */}
      <div className="bg-[#075e54] p-6 mt-2 mb-4 rounded-lg shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-white p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#075e54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <span className="ml-2 text-white font-bold text-lg">WhatsApp</span>
          </div>
          <div className="flex space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10"></path>
              <path d="M18 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-3 mt-4 px-2 py-1 bg-red-600 rounded-lg animate-pulse">DESCOBRIMOS AS MENSAGENS SECRETAS DO SEU PARCEIRO!</h2>
        <p className="text-lg sm:text-xl text-center text-white">Nosso sistema encontrou conversas comprometedoras que ele está escondendo de você!</p>
      </div>
      
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        
        {/* Simulação de conversas do WhatsApp */}
        <div className="bg-[#ece5dd] p-4 rounded-lg mb-6 shadow-md">
          <div className="flex justify-between items-center mb-2 px-2 py-2 bg-[#075e54] rounded-t-lg -mt-4 -mx-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 blur-sm">
                <img src="https://i.pravatar.cc/100?img=68" alt="Contato" className="w-full h-full object-cover" />
              </div>
              <div className="ml-3">
                <div className="text-white font-medium blur-sm">{userData.gender === 'male' ? 'Amanda S.' : 'Ricardo T.'}</div>
                <div className="text-gray-300 text-xs">online agora</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6m0 0V4m0 10h7m-7 0H5"></path>
              </svg>
            </div>
          </div>
          
          {/* Mensagens */}
          <div className="space-y-2 mt-3">
            {/* Mensagem recebida */}
            <div className="flex">
              <div className="bg-white p-2 rounded-lg max-w-[80%] shadow-md border border-gray-200">
                <p className="text-sm text-gray-800 font-medium">Oi, a gente pode conversar mais tarde?</p>
                <span className="text-xs text-gray-600 flex justify-end items-center mt-1">
                  11:42 {' '} 
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Mensagem enviada */}
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] p-2 rounded-lg max-w-[80%] shadow-md border border-green-100">
                <p className="text-sm text-gray-800 font-medium">Claro! Aconteceu algo?</p>
                <span className="text-xs text-gray-600 flex justify-end items-center mt-1">
                  11:43 {' '}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-1">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Mensagem recebida com conteúdo escondido */}
            <div className="flex">
              <div className="bg-white p-2 rounded-lg max-w-[80%] shadow-md border border-gray-200">
                <p className="text-sm text-gray-800 font-medium">Preciso te falar sobre...</p>
                <div className="bg-red-900 text-white p-2 rounded mt-1 text-xs flex items-center space-x-1 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M9 3v18"></path>
                    <path d="M13 13l6 6"></path>
                    <path d="M13 7l6-6"></path>
                  </svg>
                  <span className="animate-pulse font-bold">Conteúdo sensível oculto</span>
                </div>
                <span className="text-xs text-gray-600 flex justify-end items-center mt-1">
                  11:45 {' '}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Aviso do sistema */}
            <div className="bg-yellow-200 border-l-4 border-yellow-500 p-2 rounded text-sm text-center my-3 shadow-md">
              <p className="font-medium text-yellow-800">👁️‍🗨️ 17 mensagens sensíveis ocultadas</p>
              <p className="text-xs text-yellow-700 font-medium">Acesse o histórico completo para visualizar</p>
            </div>
            
            {/* Data das mensagens */}
            <div className="bg-[#e1f3fb] text-[#2c3e50] text-xs text-center p-1 rounded-full w-32 mx-auto my-3 font-medium shadow-sm">
              Ontem
            </div>
            
            {/* Mensagem recebida com chamada perdida */}
            <div className="flex justify-center">
              <div className="bg-red-100 p-3 rounded-lg text-sm w-48 text-center shadow-md border border-red-200">
                <p className="text-red-800 flex items-center justify-center font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                    <line x1="23" x2="1" y1="1" y2="23"></line>
                  </svg>
                  Chamada perdida (2:14)  
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do relatório */}
        <div className="bg-gray-900 border border-green-800 rounded-lg mb-6 overflow-hidden">
          {/* Cabeçalho de informações */}
          <div className="bg-green-600 text-white p-3 text-center font-bold">
            INFORMAÇÕES DO RELATÓRIO
          </div>
          
          {/* Contatos frequentes */}
          <div className="bg-gray-900 p-4">
            <h3 className="text-white text-center mb-4">Contatos frequentes no WhatsApp</h3>
            
            <div className="flex justify-between items-center">
              <button className="text-green-500">&#10094;</button>
              
              <div className="flex justify-around w-full">
                {/* Contato 1 */}
                <div className="text-center mx-2">
                  <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900"></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">7 chamadas perdidas</p>
                </div>
                
                {/* Contato 2 */}
                <div className="text-center mx-2">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300"></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">+55 *** **** 9139</p>
                  <p className="text-gray-400 text-xs">17 mensagens</p>
                </div>
                
                {/* Contato 3 */}
                <div className="text-center mx-2">
                  <div className="w-16 h-16 rounded-full bg-gray-500 mx-auto overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Mensagem de voz - 2:43</p>
                </div>
              </div>
              
              <button className="text-green-500">&#10095;</button>
            </div>
            
            {/* Indicadores */}
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            </div>
          </div>
          
          {/* Alerta de conversas suspeitas */}
          <div className="bg-gray-800 border-l-4 border-yellow-500 p-4 mx-2 my-3 rounded">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-500 w-5 h-5 mt-0.5 mr-2" />
              <div>
                <p className="text-green-400 font-medium">Conversas suspeitas encontradas no WhatsApp</p>
                <p className="text-gray-300 text-sm">Foram identificadas <span className="font-bold text-white">17 conversas</span> com conteúdo sensível e <span className="font-bold text-white">3 chamadas</span> durante a madrugada.</p>
              </div>
            </div>
          </div>
          
          {/* Amostra de conversa */}
          <div className="mx-2 mb-4 bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center bg-gray-900 p-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 mr-2"></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="text-gray-300 font-medium">Nome oculto</div>
                  <div className="text-green-500 text-xs">online</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 h-52 overflow-y-auto" style={{backgroundImage: "url('https://i.pinimg.com/736x/85/ec/df/85ecdf1c3611ecc9b7fa85282d9526e0.jpg')", backgroundSize: "cover"}}>
              {/* Mensagem recebida */}
              <div className="mb-3 max-w-[70%]">
                <div className="bg-gray-700 rounded-lg p-2">
                  <p className="text-white">Oi, você já chegou?</p>
                </div>
                <span className="text-xs text-gray-500">23:48</span>
              </div>
              
              {/* Mensagem enviada */}
              <div className="mb-3 ml-auto max-w-[70%]">
                <div className="bg-green-800 rounded-lg p-2">
                  <p className="text-white">Não... ainda estou com ******* </p>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">23:47</span>
                </div>
              </div>
              
              {/* Mensagem recebida com alerta */}
              <div className="mb-3 max-w-[70%]">
                <div className="bg-gray-700 rounded-lg p-2 flex">
                  <p className="text-white">Denovo? Você disse que **** **** **** </p>
                  <div className="ml-1 text-red-500 text-xs px-1 py-0.5 bg-red-900 rounded">Conteúdo sensível</div>
                </div>
                <span className="text-xs text-gray-500">23:50</span>
              </div>
              
              {/* Mensagem enviada */}
              <div className="mb-3 ml-auto max-w-[70%]">
                <div className="bg-green-800 rounded-lg p-2">
                  <p className="text-white">Não acredito!! Você sempre faz isso quando **** **** </p>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">23:55</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        
        {/* Contador regressivo */}
        <div className="bg-gray-800 border border-yellow-600 rounded-lg p-4 mb-6 text-center">
          <h3 className="text-yellow-500 mb-2">Esta oferta exclusiva expira em:</h3>
          <div className="text-3xl font-bold">
            ⏰ {minutes.toString().padStart(2, '0')} minutos : {seconds.toString().padStart(2, '0')} segundos
          </div>
        </div>
        
        {/* CTA Duplo */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-8">
          <Button 
            onClick={onAccept}
            className="bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-bold md:flex-1 animate-pulse"
          >
            SIM! Quero o Histórico Completo de 12 Meses
          </Button>
        </div>
        
        {/* Parabéns + Revelação */}
        <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-green-500 mb-6 shadow-lg overflow-hidden">
          <div className="bg-green-600 py-3 px-4 text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center">
              <CheckCircle className="mr-2 h-6 w-6" /> Parabéns pela sua decisão!
            </h2>
          </div>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mt-16 -mr-16 z-0"></div>
            <div className="relative z-10">
              <p className="mb-5 text-white text-lg leading-relaxed border-l-4 border-green-500 pl-4 py-2">
                Você tomou a atitude certa ao buscar a verdade. Sabemos como é difícil viver na incerteza, 
                e agora você terá as respostas que precisa sobre as últimas 48 horas.
              </p>
              
              <div className="bg-yellow-500/20 p-4 rounded-lg border-l-4 border-yellow-500 mb-4">
                <p className="text-yellow-400 font-bold text-lg mb-2 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Descobrimos algo importante...
                </p>
                <p className="text-gray-100">
                  Nossa análise revelou que <span className="font-bold text-yellow-400">87%</span> das conversas comprometedoras acontecem <span className="font-bold underline">FORA</span> desse período de 48 horas. 
                  Pessoas experientes em relacionamentos paralelos sabem exatamente como esconder rastros recentes, 
                  mas deixam pistas no histórico mais antigo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Seção verdades dolorosas - resumido */}
        <Card className="bg-gray-800 border-red-800 mb-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3">4 Verdades que Todo Cliente Precisa Saber:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <AlertTriangle className="text-red-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>73% das traições são descobertas através de mensagens antigas, não recentes</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="text-red-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Quem trai desenvolve padrões que só aparecem no histórico completo</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Revelação do preço e pagamento */}
        <Card className="bg-gradient-to-b from-gray-900 to-black border-2 border-green-500 mb-6 shadow-lg shadow-green-500/20">
          <div className="bg-green-600 py-2 px-4 text-center">
            <h3 className="text-lg font-bold text-white">OFERTA ESPECIAL - APENAS HOJE</h3>
          </div>
          <CardContent className="p-8 text-center">
            <div className="mb-2 text-gray-300 text-sm uppercase font-medium">De <span className="line-through">R$ 49,90</span> por apenas:</div>
            <div className="text-5xl font-bold text-white mb-2 bg-green-600 py-2 rounded-md shadow-lg">
              R$ 29,90
            </div>
            <p className="text-white font-medium mb-4 bg-gray-800 inline-block px-4 py-1 rounded-full">Pagamento único</p>
            <div className="flex justify-center items-center space-x-3 mb-4 bg-gray-800 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-green-400" />
              <span className="text-white font-medium">Compra 100% Segura</span>
            </div>
            
            {showPix ? (
              <div className="border-2 border-green-500 rounded-lg p-6 bg-gray-900 shadow-lg mt-4">
                <div className="bg-green-600 py-2 px-3 rounded-md text-center mb-4">
                  <div className="text-lg font-bold text-white flex items-center justify-center">
                    <QrCode className="mr-2 h-5 w-5" /> PAGUE COM PIX
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 bg-gray-800 rounded-lg">
                    <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-2" />
                    <p className="text-white font-medium">Gerando código PIX...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-inner border border-gray-200">
                      <div className="text-black text-base font-mono break-all bg-gray-100 p-3 rounded">
                        {pixCode}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCopyPix} 
                      className="w-full mb-4 bg-green-600 hover:bg-green-700 font-bold py-3 text-base shadow-lg shadow-green-900/40 border-b-4 border-green-700 transition-all hover:translate-y-1 hover:border-b-2"
                      size="lg"
                    >
                      {copied ? (
                        <span className="flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2" /> CÓDIGO COPIADO!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Copy className="h-5 w-5 mr-2" /> COPIAR CÓDIGO PIX
                        </span>
                      )}
                    </Button>
                    
                    <div className="text-white bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-center">
                      Após o pagamento, você será automaticamente redirecionado
                    </div>
                    
                    {paymentStatus === 'pending' ? (
                      <div className="flex items-center justify-center text-amber-400 text-sm">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aguardando pagamento...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-green-500 text-sm bg-green-900/30 p-2 rounded-md">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Pagamento aprovado! Redirecionando...
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Campo email */}
                <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-blue-600 shadow-lg">
                  <Label htmlFor="email" className="flex items-center text-left mb-2 text-blue-400 font-medium">
                    <Mail className="h-5 w-5 mr-2 text-blue-500" />
                    SEU E-MAIL PARA RECEBER O HISTÓRICO:
                  </Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-blue-900/20 border-blue-700 text-white pl-10 pr-4 py-3 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-green-500" />
                    Seus dados são criptografados e protegidos
                  </p>
                </div>
                
                <Button
                  onClick={handleGeneratePix}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-lg py-3 w-full font-bold animate-pulse"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Gerando PIX...
                    </span>
                  ) : (
                    'QUERO O HISTÓRICO COMPLETO DE 12 MESES!'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
};

export default UpsellPage;
