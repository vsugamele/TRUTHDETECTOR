
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface AnalyzingProfileProps {
  onComplete: () => void;
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

const AnalyzingProfile = ({ onComplete }: AnalyzingProfileProps) => {
  const [showTinderAlert, setShowTinderAlert] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  useEffect(() => {
    // Registrar início da análise do perfil
    trackEvent("profile_analyzing_started");
    
    const checkpoints = [
      { time: 500, event: "analysis_step_activity_check" },
      { time: 1500, event: "analysis_step_photos_check" },
      { time: 2500, event: "analysis_step_location_check" },
      { time: 3000, event: "analysis_step_tinder_discovery" },
      { time: 4500, event: "analysis_step_report_compiling" }
    ];
    
    // Registrar cada etapa da análise
    const stepTimers = checkpoints.map(({ time, event }) => 
      setTimeout(() => {
        trackEvent(event, { timestamp: new Date().toISOString() });
        
        // Quando descobrir o Tinder, mostrar o alerta
        if (event === "analysis_step_tinder_discovery") {
          setShowTinderAlert(true);
          
          // Tocar um som de notificação (opcional)
          try {
            const notificationSound = new Audio("/notification.mp3");
            notificationSound.play();
          } catch (e) {
            console.log("Não foi possível tocar o som de notificação");
          }
        }
      }, time)
    );
    
    // Marcar análise como completa antes do callback final
    const analysisTimer = setTimeout(() => {
      setAnalysisComplete(true);
      trackEvent("profile_analyzing_completed", { duration: 8000, tinderMessagesFound: true });
    }, 5000);
    
    // Atraso extra antes de ir para a próxima etapa para dar tempo do usuário ver o alerta
    const timer = setTimeout(() => {
      onComplete();
    }, 10000); // 10 segundos de análise total para dar tempo de ver a imagem

    return () => {
      clearTimeout(timer);
      clearTimeout(analysisTimer);
      stepTimers.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-purple">
      <Card className="w-full max-w-md bg-tinder-dark-purple border-purple-700 text-white">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="w-full h-full border-4 border-pink-500 border-t-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-2 border-2 border-orange-500 border-b-transparent rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Analisando perfil...</h2>
            <p className="text-gray-300 text-sm">
              Cruzando dados do perfil. Por favor, aguarde.
            </p>
          </div>

          {/* Alerta de descoberta de mensagens no Tinder */}
          {showTinderAlert && (
            <div className="mb-6">
              <Alert className="bg-red-900/80 border-red-500 text-white animate-pulse mb-4">
                <AlertTitle className="text-red-300 font-bold flex items-center">
                  ⚠️ ALERTA: Mensagens encontradas!
                </AlertTitle>
                <AlertDescription className="text-sm">
                  Descobrimos mensagens privadas no Tinder que podem ser relevantes.
                </AlertDescription>
              </Alert>
              
              <div className="border-2 border-red-500 rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://laisevip.com/wp-content/uploads/2025/06/tinder.png"
                  alt="Mensagens do Tinder"
                  className="w-full"
                />
              </div>
              
              <p className="text-amber-300 text-sm font-semibold">
                Continuando análise para descobrir mais detalhes...
              </p>
            </div>
          )}

          <div className="space-y-3 text-left">
            <AnalysisStep text="Verificando atividade recente" delay={500} />
            <AnalysisStep text="Buscando fotos do perfil" delay={1500} />
            <AnalysisStep text="Analisando localização" delay={2500} />
            {analysisComplete && (
              <AnalysisStep text="🔥 Perfis de relacionamento detectados" delay={3000} />
            )}
            <AnalysisStep text="Compilando relatório" delay={4500} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AnalysisStep = ({ text, delay }: { text: string; delay: number }) => {
  const [isActive, setIsActive] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    const activeTimer = setTimeout(() => setIsActive(true), delay);
    const completeTimer = setTimeout(() => setIsComplete(true), delay + 800);

    return () => {
      clearTimeout(activeTimer);
      clearTimeout(completeTimer);
    };
  }, [delay]);

  return (
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
        isComplete ? 'bg-green-500' : isActive ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'
      }`} />
      <span className={`text-sm transition-colors duration-300 ${
        isComplete ? 'text-green-400' : isActive ? 'text-yellow-400' : 'text-gray-500'
      }`}>
        {text}
      </span>
      {isComplete && <span className="text-green-400 text-sm">✓</span>}
    </div>
  );
};

export default AnalyzingProfile;
