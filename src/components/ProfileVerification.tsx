import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useWhatsAppProfile } from '@/hooks/useWhatsAppProfile';
interface ProfileVerificationProps {
  onComplete: (data: {
    phone: string;
    gender: string;
    name: string;
    age: string;
    profilePhoto?: string;
  }) => void;
}

type Step = 'gender' | 'age' | 'name' | 'phone';

const ProfileVerification = ({
  onComplete
}: ProfileVerificationProps) => {
  // Estados para todos os campos do formulário
  const [currentStep, setCurrentStep] = useState<Step>('gender');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  
  // Estados para o processo de verificação
  const [profileVerified, setProfileVerified] = useState(false);
  const [isLoadingProfilePhoto, setIsLoadingProfilePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Referência para gerenciar timeouts
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook para buscar perfil do WhatsApp
  const { fetchProfile, isLoading: isWhatsAppLoading } = useWhatsAppProfile();

  // Imagem genérica de fallback para quando não encontrar foto
  const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";  

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
  
  // Navegação entre etapas
  const goToNextStep = () => {
    switch (currentStep) {
      case 'gender':
        trackEvent("gender_selected", { gender });
        setCurrentStep('age');
        break;
      case 'age':
        trackEvent("age_submitted", { age });
        setCurrentStep('name');
        break;
      case 'name':
        trackEvent("name_submitted", { name });
        setCurrentStep('phone');
        break;
      case 'phone':
        handlePhoneSubmit();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'age':
        setCurrentStep('gender');
        break;
      case 'name':
        setCurrentStep('age');
        break;
      case 'phone':
        setCurrentStep('name');
        break;
    }
  };
  
  // Validação de cada etapa
  const canProceed = () => {
    switch (currentStep) {
      case 'gender':
        return !!gender;
      case 'age':
        return !!age;
      case 'name':
        return !!name;
      case 'phone':
        return phone.length >= 10 && !isWhatsAppLoading;
      default:
        return false;
    }
  };

  // Buscar perfil do WhatsApp quando o número for inserido
  const handlePhoneSubmit = async () => {
    if (phone.length < 10) return;
    
    trackEvent("phone_verification_started", { phoneLength: phone.length });
    setIsLoadingProfilePhoto(true);
    setError(null);

    try {
      const profile = await fetchProfile(phone);
      
      // Sempre indica que encontrou o perfil, independente do resultado real
      setProfileVerified(true);
      
      if (profile && profile.photoUrl) {
        // Se encontrou uma foto real
        setProfilePhoto(profile.photoUrl);
        trackEvent("profile_photo_found");
      } else {
        // Se não encontrou foto, não mostra nenhuma imagem
        setProfilePhoto(undefined);
        trackEvent("profile_photo_not_found");
      }
      
      // Agora que todos os dados foram coletados, pode finalizar
      finalizeVerification();
      
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setError("Não foi possível verificar o número. Tente novamente.");
      setProfileVerified(false);
      setIsLoadingProfilePhoto(false);
    }
  };

  const finalizeVerification = () => {
    // Todos os dados foram coletados, finaliza o processo
    trackEvent("verification_complete", {
      phoneLength: phone.length,
      gender,
      name,
      age,
      hasProfilePhoto: !!profilePhoto
    });
    
    onComplete({
      phone,
      gender,
      name,
      age,
      profilePhoto
    });
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setPhone(numbers);
    
    // Limpar timeout anterior se existir
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Limpa o timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Barra de progresso para mostrar em qual etapa está
  const renderProgressBar = () => {
    const steps = ['Gênero', 'Idade', 'Nome', 'Telefone'];
    let currentStepIndex = 0;
    
    switch (currentStep) {
      case 'gender': currentStepIndex = 0; break;
      case 'age': currentStepIndex = 1; break;
      case 'name': currentStepIndex = 2; break;
      case 'phone': currentStepIndex = 3; break;
    }
    
    return (
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center w-full">
            <div className={`w-full h-2 ${index === 0 ? 'rounded-l-full' : ''} ${index === steps.length - 1 ? 'rounded-r-full' : ''} ${index <= currentStepIndex ? 'bg-pink-600' : 'bg-gray-600'}`} />
            <span className={`text-xs mt-1 ${index <= currentStepIndex ? 'text-pink-500 font-medium' : 'text-gray-400'}`}>{step}</span>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar a etapa de seleção de gênero
  const renderGenderStep = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {['Homem', 'Mulher', 'Outro'].map(option => (
            <Button 
              key={option} 
              onClick={() => setGender(option)} 
              variant={gender === option ? "default" : "outline"} 
              className={`p-5 text-base ${gender === option ? 'bg-pink-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderizar a etapa de idade
  const renderAgeStep = () => {
    return (
      <div className="space-y-4">
        <Input
          type="number"
          placeholder="Ex: 28"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white text-center text-xl p-6"
          min="18"
          max="80"
        />
      </div>
    );
  };
  
  // Renderizar a etapa de nome
  const renderNameStep = () => {
    return (
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Nome do parceiro(a)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white text-center text-xl p-6"
        />
      </div>
    );
  };
  
  // Renderizar a etapa do telefone
  const renderPhoneStep = () => {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex space-x-2">
            <div className="flex items-center bg-gray-700 px-3 rounded-lg">
              <span className="text-sm">+55</span>
            </div>
            <Input 
              type="tel" 
              placeholder="DDD + número (ex: 11996284159)" 
              value={phone} 
              onChange={(e) => formatPhone(e.target.value)} 
              maxLength={11} 
              className="flex-1 bg-gray-700 border-gray-600 text-white text-center text-xl p-6" 
            />
          </div>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          
          {profileVerified && profilePhoto && (
            <div className="text-center mt-4">
              <p className="text-green-400 text-sm mb-2">Perfil verificado!</p>
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-green-500">
                <img src={profilePhoto} alt="Foto do perfil" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Renderizar o conteúdo específico de cada etapa
  const renderStepContent = () => {
    switch (currentStep) {
      case 'gender': 
        return renderGenderStep();
      case 'age':
        return renderAgeStep();
      case 'name':
        return renderNameStep();
      case 'phone':
        return renderPhoneStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com alerta */}
        <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium rounded-t-lg">
          ⚠️ Atenção: Restam apenas 8 testes gratuitos para hoje!
        </div>

        <Card className="bg-tinder-dark border-gray-700 text-white rounded-t-none">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-center mb-2">
              Verificação de Perfil
            </h2>
            <p className="text-gray-300 text-center text-sm mb-6">
              {currentStep === 'gender' && "Selecione o gênero do(a) parceiro(a)"}
              {currentStep === 'age' && "Qual a idade do(a) parceiro(a)?"}
              {currentStep === 'name' && "Qual o nome do(a) parceiro(a)?"}
              {currentStep === 'phone' && "Digite o número do WhatsApp para verificação"}
            </p>
            
            {/* Barra de progresso */}
            {renderProgressBar()}
            
            {/* Conteúdo específico da etapa */}
            {renderStepContent()}
            
            {/* Botões de navegação */}
            <div className="flex space-x-3 mt-6">
              {currentStep !== 'gender' && (
                <Button 
                  onClick={goToPreviousStep}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white" 
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              )}
              
              <Button 
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {currentStep === 'phone' ? (
                  isWhatsAppLoading || isLoadingProfilePhoto ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</>
                  ) : (
                    <>Verificar Agora</>
                  )
                ) : (
                  <>Continuar <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ProfileVerification;