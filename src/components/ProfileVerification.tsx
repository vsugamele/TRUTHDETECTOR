import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { useWhatsAppProfile } from '@/hooks/useWhatsAppProfile';
interface ProfileVerificationProps {
  onComplete: (data: {
    phone: string;
    gender: string;
    profilePhoto?: string;
  }) => void;
}

const ProfileVerification = ({
  onComplete
}: ProfileVerificationProps) => {
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [photoFound, setPhotoFound] = useState(false);
  const [profileVerified, setProfileVerified] = useState(false);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    fetchProfile,
    isLoading,
    error
  } = useWhatsAppProfile();

  // Imagem genérica de fallback para quando não encontrar foto
  const defaultProfileImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";  

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) return;
    
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

    trackEvent("phone_verification_started", { phoneLength: phone.length });

    const profile = await fetchProfile(phone);
    
    // Sempre indica que encontrou o perfil, independente do resultado real
    setProfileVerified(true);
    
    if (profile && profile.photoUrl) {
      // Se encontrou uma foto real
      setProfilePhoto(profile.photoUrl);
      setPhotoFound(true);
      
      // Rastrear evento de foto encontrada
      if (window.clarity) {
        window.clarity("event", "profile_photo_found");
      }
    } else {
      // Se não encontrou foto, não mostra nenhuma imagem
      setProfilePhoto(undefined);
      // Ainda mostra que encontrou dados
      setPhotoFound(true);
      
      // Rastrear evento de foto não encontrada
      if (window.clarity) {
        window.clarity("event", "profile_photo_not_found");
      }
    }
    
    // Rastrear evento de verificação do número concluída
    if (window.clarity) {
      window.clarity("event", "phone_verification_completed", {
        hasPhoto: !!profile?.photoUrl
      });
    }
  };

  const handleVerify = () => {
    if (phone && gender) {
      onComplete({
        phone,
        gender,
        profilePhoto
      });
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    setPhone(numbers);
    
    // Inicia a detecção automática após o usuário parar de digitar
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Só inicia a busca se o número tiver pelo menos 10 dígitos
    if (numbers.length >= 10 && autoDetectEnabled) {
      typingTimeoutRef.current = setTimeout(() => {
        handlePhoneSubmit();
      }, 800); // 800ms após parar de digitar
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

  return <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com alerta */}
        <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium rounded-t-lg">
          ⚠️ Atenção: Restam apenas 8 testes gratuitos para sua região hoje!
        </div>

        <Card className="bg-tinder-dark border-gray-700 text-white rounded-t-none">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-center mb-6">
              Verificação de Perfil
            </h2>
            <p className="text-gray-300 text-center text-sm mb-6">
              Preencha os dados para iniciar a busca.
            </p>

            <div className="space-y-4">
              {/* Número do WhatsApp */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  1. Número do WhatsApp
                </label>
                <div className="flex space-x-2">
                  <div className="flex items-center bg-gray-700 px-3 rounded-lg">
                    <span className="text-sm">+55</span>
                  </div>
                  <Input 
                    type="tel" 
                    placeholder="11996284159" 
                    value={phone} 
                    onChange={e => formatPhone(e.target.value)} 
                    onBlur={() => phone.length >= 10 && handlePhoneSubmit()}
                    maxLength={11} 
                    className="flex-1 bg-gray-700 border-gray-600 text-white" 
                  />
                  <Button 
                    onClick={handlePhoneSubmit} 
                    disabled={phone.length < 10 || isLoading} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 transition-opacity" 
                    title="Verificar manualmente"
                  >
                    {isLoading ? '...' : '✓'}
                  </Button>
                </div>
                {profileVerified && <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 text-sm">Perfil encontrado!</span>
                  </div>}
                {error && !profileVerified && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              {/* Dados encontrados - sempre mostra após verificação */}
              {profileVerified && <div className="text-center">
                  <p className="text-green-400 text-sm mb-2">Dados Suspeitos Encontrados!</p>
                  {profilePhoto && (
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-green-500">
                      <img src={profilePhoto} alt="Foto do perfil" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>}

              {/* Gênero */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  2. Gênero do(a) parceiro(a)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Homem', 'Mulher', 'Outro'].map(option => <Button key={option} onClick={() => setGender(option)} variant={gender === option ? "default" : "outline"} className={`text-sm ${gender === option ? 'bg-pink-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}>
                      {option}
                    </Button>)}
                </div>
              </div>

              <Button 
                onClick={handleVerify} 
                disabled={!phone || !gender || phone.length < 10} 
                className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-3 rounded-full mt-6 animate-pulse hover:animate-none shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-green-300"
              >
                Verificar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default ProfileVerification;