import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Check, User } from 'lucide-react';
import './notifications.css';

interface Notification {
  id: number;
  message: string;
  type: 'discovery' | 'activity' | 'photos';
  timeAgo: string;
}

// Lista ampla de notificações possíveis
const notificationMessages: { message: string; type: 'discovery' | 'activity' | 'photos' }[] = [
  { message: 'Maria S. encontrou o perfil secreto do parceiro', type: 'discovery' },
  { message: 'Fernanda L. acabou de descobrir que o parceiro está ativo no Tinder', type: 'activity' },
  { message: 'Ana C. encontrou fotos comprometedoras do namorado', type: 'photos' },
  { message: 'Pedro M. confirmou traição do parceiro usando o relatório', type: 'discovery' },
  { message: 'Juliana P. descobriu 3 perfis secretos em diferentes apps', type: 'discovery' },
  { message: 'Carlos B. encontrou o parceiro conversando com ex no Tinder', type: 'activity' },
  { message: 'Bruna S. detectou atividade suspeita do namorado às 3h da manhã', type: 'activity' },
  { message: 'Paulo R. descobriu que a namorada tem perfil falso', type: 'discovery' },
  { message: 'Camila F. encontrou fotos do parceiro em festas escondidas', type: 'photos' },
  { message: 'Roberto T. flagrou parceiro trocando mensagens com 7 pessoas', type: 'activity' },
  { message: 'Amanda L. descobriu perfil secreto criado há apenas 2 dias', type: 'discovery' },
  { message: 'João P. identificou atividade constante do parceiro em apps de relacionamento', type: 'activity' },
  { message: 'Marcela R. encontrou álbum secreto com 23 fotos', type: 'photos' },
  { message: 'Thiago M. confirmou suspeitas de traição via localização', type: 'discovery' },
  { message: 'Débora K. descobriu que parceiro está no Tinder há 3 meses', type: 'discovery' },
  { message: 'Lucas V. encontrou fotos do parceiro com outra pessoa', type: 'photos' },
  { message: 'Mariana T. detectou uso do Tinder em cidade onde parceiro viajou', type: 'activity' },
  { message: 'Bruno L. descobriu perfis em múltiplos apps de encontro', type: 'discovery' },
  { message: 'Carolina S. flagrou atividade do parceiro no momento da verificação', type: 'activity' },
  { message: 'Eduardo F. encontrou fotos íntimas compartilhadas pelo parceiro', type: 'photos' }
];

// Tempos possíveis para exibição
const possibleTimes = ['agora mesmo', 'há 1 minuto', 'há 2 minutos', 'há 5 minutos', 'há alguns minutos', 'há pouco tempo'];

const LiveNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotification, setVisibleNotification] = useState<Notification | null>(null);

  // Gera notificações aleatórias
  useEffect(() => {
    // Cria pool inicial de notificações
    const initialNotifications: Notification[] = notificationMessages.map((msg, index) => ({
      id: index,
      ...msg,
      timeAgo: possibleTimes[Math.floor(Math.random() * possibleTimes.length)]
    }));
    
    setNotifications(initialNotifications);
  }, []);

  // Gerencia a exibição das notificações
  useEffect(() => {
    if (notifications.length === 0) return;
    
    // Intervalo para mostrar notificações (entre 5 e 10 segundos)
    const showInterval = setInterval(() => {
      // Seleciona uma notificação aleatória
      const randomIndex = Math.floor(Math.random() * notifications.length);
      const notification = notifications[randomIndex];
      
      // Atualiza o tempo da notificação
      const updatedNotification = {
        ...notification,
        timeAgo: possibleTimes[Math.floor(Math.random() * possibleTimes.length)]
      };
      
      // Mostra a notificação
      setVisibleNotification(updatedNotification);
      
      // Esconde após 4 segundos
      setTimeout(() => {
        setVisibleNotification(null);
      }, 4000);
      
    }, 5000 + Math.random() * 5000);
    
    return () => {
      clearInterval(showInterval);
    };
  }, [notifications]);

  // Se não há notificação visível, não renderiza nada
  if (!visibleNotification) return null;

  // Determina o ícone baseado no tipo
  const getIcon = (type: string) => {
    switch (type) {
      case 'discovery':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'activity':
        return <Bell className="w-4 h-4 text-orange-400" />;
      case 'photos':
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 shadow-lg notification-enter"
    >
      <div className="bg-gradient-to-r from-blue-950 to-black p-3 rounded-lg shadow-lg border border-blue-800 max-w-xs">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            {getIcon(visibleNotification.type)}
          </div>
          <div>
            <div className="text-sm text-white font-medium">{visibleNotification.message}</div>
            <div className="text-xs text-gray-400">{visibleNotification.timeAgo}</div>
          </div>
        </div>
      </div>
      
      {/* As animações são definidas no CSS global ou via classes Tailwind */}
    </div>
  );
};

export default LiveNotifications;
