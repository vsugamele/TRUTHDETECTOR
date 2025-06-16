
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyzingProfileProps {
  onComplete: () => void;
}

const AnalyzingProfile = ({ onComplete }: AnalyzingProfileProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 segundos de análise

    return () => clearTimeout(timer);
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

          <div className="space-y-3 text-left">
            <AnalysisStep text="Verificando atividade recente" delay={500} />
            <AnalysisStep text="Buscando fotos do perfil" delay={1500} />
            <AnalysisStep text="Analisando localização" delay={2500} />
            <AnalysisStep text="Compilando relatório" delay={3500} />
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
