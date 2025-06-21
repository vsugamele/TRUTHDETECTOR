import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Upload, Image } from 'lucide-react';
import { useWhatsAppProfile } from '@/hooks/useWhatsAppProfile';
import { useSound } from './useSound';
import LocationSelector from './LocationSelector';
interface ProfileVerificationProps {
  onComplete: (data: {
    phone: string;
    gender: string;
    name: string;
    age: string;
    location?: string;
    profilePhoto?: string;
    userPhotos?: string[];
  }) => void;
}

type Step = 'gender' | 'age' | 'name' | 'location' | 'photos' | 'phone';

const ProfileVerification = ({
  onComplete
}: ProfileVerificationProps) => {
  // Hook para uso de sons
  const { playSound } = useSound();
  // Estados para todos os campos do formulário
  const [currentStep, setCurrentStep] = useState<Step>('gender');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  
  // Estados para o processo de verificação
  const [profileVerified, setProfileVerified] = useState(false);
  const [isLoadingProfilePhoto, setIsLoadingProfilePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para upload de fotos
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  // Referência para gerenciar timeouts e para input de arquivo
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    // Tocar som de clique ao avançar
    playSound('click', 0.3);
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
        setCurrentStep('location');
        break;
      case 'location':
        trackEvent("location_submitted", { location });
        setCurrentStep('photos');
        break;
      case 'photos':
        trackEvent("photos_submitted", { photosCount: photoPreviewUrls.length });
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
      case 'location':
        setCurrentStep('name');
        break;
      case 'photos':
        setCurrentStep('location');
        break;
      case 'phone':
        setCurrentStep('photos');
        break;
    }
  };
  
  // Selecionar gênero e avançar automaticamente
  const selectGender = (selected: string) => {
    setGender(selected);
    // Avançar automaticamente após selecionar o gênero
    setTimeout(() => {
      trackEvent("gender_selected", { gender: selected });
      setCurrentStep('age');
    }, 300); // Pequeno delay para mostrar a seleção antes de avançar
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
      case 'location':
        return !!location;
      case 'photos':
        return true; // Fotos são opcionais, sempre pode avançar
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

    console.log("ProfileVerification - Iniciando busca de foto para o telefone:", phone);

    try {
      // Busca o perfil pelo número de telefone
      const profile = await fetchProfile(phone);
      
      console.log("ProfileVerification - Resposta da API:", profile);
      
      // Sempre indica que encontrou o perfil, independente do resultado real
      setProfileVerified(true);
      
      if (profile && profile.photoUrl && profile.photoUrl.length > 0) {
        // Se encontrou uma foto real
        console.log("ProfileVerification - Foto encontrada:", profile.photoUrl);
        setProfilePhoto(profile.photoUrl);
        trackEvent("profile_photo_found");
      } else {
        // Se não encontrou foto, não mostra nenhuma imagem
        console.log("ProfileVerification - Nenhuma foto encontrada");
        setProfilePhoto(""); // Usando string vazia em vez de undefined
        trackEvent("profile_photo_not_found");
      }
      
      console.log("ProfileVerification - URL da foto antes de finalizar:", profile?.photoUrl || "Sem foto");
      
      // Pequeno timeout para garantir que o estado foi atualizado antes de finalizar
      setTimeout(() => {
        console.log("ProfileVerification - Estado final antes de finalizar:", { profilePhoto });
        finalizeVerification();
      }, 100);
      
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setError("Não foi possível verificar o número. Tente novamente.");
      setProfileVerified(false);
      setIsLoadingProfilePhoto(false);
    }
  };

  const finalizeVerification = () => {
    // Verificar se todos os dados obrigatórios estão preenchidos
    if (!gender || !age || !name || !phone) {
      return;
    }

    // Registrar evento de conclusão no Clarity
    trackEvent("verification_completed", {
      gender,
      age,
      name,
      location,
      phone,
      hasProfilePhoto: !!profilePhoto,
      hasUserPhotos: photoPreviewUrls.length > 0,
      userPhotosCount: photoPreviewUrls.length
    });

    // Chamar o callback de conclusão
    onComplete({
      gender,
      age, 
      name,
      phone,
      location,
      profilePhoto,
      userPhotos: photoPreviewUrls
    });
  };

  const formatPhone = (value: string) => {
    // Remover todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    setPhone(numericValue);
    
    // Limpar erro quando o usuário começar a digitar
    if (error) setError(null);

    // Cancelar qualquer timeout pendente
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
  
  // Função para lidar com a seleção de arquivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Limitar a 3 fotos
    const filesToAdd = selectedFiles.slice(0, 3 - uploadedPhotos.length);
    if (filesToAdd.length < selectedFiles.length) {
      setError('Máximo de 3 fotos permitido');
      setTimeout(() => setError(null), 3000);
    }
    
    setUploadedPhotos(prev => [...prev, ...filesToAdd]);
    
    // Criar URLs temporárias para preview
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  // Função para remover uma foto
  const removePhoto = (index: number) => {
    // Revogar a URL para evitar vazamento de memória
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  // Função para lidar com a seleção de localização
  const handleLocationSelected = (selectedLocation: string) => {
    setLocation(selectedLocation);
    // Já que removemos o botão de confirmar, usamos o valor imediatamente
  };

  // Limpa o timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Calcular o progresso com base na etapa atual
  const calculateProgress = () => {
    switch (currentStep) {
      case 'gender': return 16;
      case 'age': return 33;
      case 'name': return 50;
      case 'location': return 66;
      case 'photos': return 83;
      case 'phone': return 100;
      default: return 0;
    }
  };
  
  // Barra de progresso para mostrar em qual etapa está
  const renderProgressBar = () => {
    const progress = calculateProgress();
    
    return (
      <div className="w-full bg-gray-700 h-2 rounded-full mb-6">
        <div 
          className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  // Renderizar a etapa de seleção de gênero
  const renderGenderStep = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center space-x-4">
          <div 
            onClick={() => selectGender('Homem')} 
            className={`px-6 py-3 border rounded-md cursor-pointer transition-colors ${gender === 'Homem' ? 'bg-pink-500 text-white border-pink-700' : 'bg-gray-700 border-gray-600'}`}>
            Homem
          </div>
          <div 
            onClick={() => selectGender('Mulher')} 
            className={`px-6 py-3 border rounded-md cursor-pointer transition-colors ${gender === 'Mulher' ? 'bg-pink-500 text-white border-pink-700' : 'bg-gray-700 border-gray-600'}`}>
            Mulher
          </div>
          <div 
            onClick={() => selectGender('Outro')} 
            className={`px-6 py-3 border rounded-md cursor-pointer transition-colors ${gender === 'Outro' ? 'bg-pink-500 text-white border-pink-700' : 'bg-gray-700 border-gray-600'}`}>
            Outro
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar a etapa de localização
  const renderLocationStep = () => {
    return (
      <div className="space-y-4">
        <LocationSelector 
          onLocationSelected={handleLocationSelected} 
          className="" 
        />
      </div>
    );
  };
  
  // Renderizar a etapa de upload de fotos
  const renderPhotosStep = () => {
    return (
      <div className="space-y-6">
        {/* Texto sobre intuição */}
        <div className="text-white mb-4">
          <h3 className="text-pink-500 font-bold mb-2">💔 SUA INTUIÇÃO ESTAVA CERTA?</h3>
          <p className="text-sm">
            Se você chegou até aqui, é porque algo não está
            certo. Pare de sofrer com dúvidas - descubra a
            verdade em 2 minutos.
          </p>
        </div>
        
        {/* Seção de upload */}
        <div>
          <h3 className="text-yellow-400 font-bold mb-2">📸 ADICIONE UMA FOTO E DESCUBRA TUDO</h3>
          
          {/* Área de preview das fotos */}
          <div className="flex justify-center flex-wrap gap-3 mb-4 bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-500">
            {photoPreviewUrls.map((url, index) => (
              <div key={index} className="relative w-20 h-20">
                <img 
                  src={url} 
                  alt={`Foto ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md border border-gray-600" 
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  title="Remover foto"
                >
                  &times;
                </button>
              </div>
            ))}
            
            {photoPreviewUrls.length === 0 && (
              <div className="text-center py-6 w-full">
              </div>
            )}
          </div>
          
          {/* Input de arquivo oculto */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileSelect} 
          />
          
          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          
          <div className="flex justify-center my-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-6 w-full rounded-lg shadow-lg animate-pulse transform transition-transform hover:scale-105"
            >
              📤 SELECIONAR FOTOS - DESCOBRIR AGORA
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-white text-sm">
              Nossa IA militar irá escanear instantaneamente:
            </p>
            
            <ul className="space-y-2">
              <li className="text-green-400 flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Tinder, Bumble, Happn (apps de relacionamento)</span>
              </li>
              <li className="text-green-400 flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Instagram, Facebook, TikTok (contas secretas)</span>
              </li>
              <li className="text-green-400 flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>OnlyFans, sites adultos (perfis ocultos)</span>
              </li>
              <li className="text-green-400 flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Mais de 200 plataformas digitais</span>
              </li>
            </ul>
            

            
            <div className="space-y-2 text-center">
              <p className="text-yellow-400 font-semibold">💡 UMA FOTO = INVESTIGAÇÃO COMPLETA</p>
              <p className="text-white text-sm">🔒 Suas fotos são criptografadas e deletadas após uso</p>
              <p className="text-white text-sm">⚡ Resultado em 30-90 segundos</p>
            </div>
            
            <p className="text-yellow-500 text-sm text-center font-semibold mt-4">
              ⚠️ "Clientes relatam: 89% descobrem algo que não sabiam sobre o parceiro"
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar a etapa de idade com botões de faixa etária
  const renderAgeStep = () => {
    const ageRanges = ["18-24", "25-32", "33-40", "41-50", "51-60", "60+"];
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {ageRanges.map((range) => (
            <Button 
              key={range} 
              onClick={() => setAge(range)}
              className={`py-3 px-4 text-lg font-medium ${age === range 
                ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
            >
              {range}
            </Button>
          ))}
        </div>
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
  
  // Renderizar a etapa atual baseado no estado
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'gender':
        return renderGenderStep();
      case 'age':
        return renderAgeStep();
      case 'name':
        return renderNameStep();
      case 'location':
        return renderLocationStep();
      case 'photos':
        return renderPhotosStep();
      case 'phone':
        return renderPhoneStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header sem alerta */}

        <Card className="bg-tinder-dark border-gray-700 text-white rounded-t-none">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-center mb-2">
              Verificação de Perfil
            </h2>
            <p className="text-gray-300 text-center text-sm mb-6">
              {currentStep === 'gender' && "Selecione o gênero do(a) parceiro(a)"}
              {currentStep === 'age' && "Qual a idade do(a) parceiro(a)?"}
              {currentStep === 'name' && "Qual o nome do(a) parceiro(a)?"}
              {currentStep === 'location' && "Onde o(a) parceiro(a) costuma estar?"}
              {currentStep === 'photos' && ""}
              {currentStep === 'phone' && "Digite o número do WhatsApp para verificação"}
            </p>
            
            {/* Barra de progresso */}
            {renderProgressBar()}
            
            {/* Conteúdo específico da etapa */}
            {renderCurrentStep()}
            
            {/* Botão de navegação (sem o botão de voltar) */}
            <div className="flex mt-6">
              <Button 
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
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