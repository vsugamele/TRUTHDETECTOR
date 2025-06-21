import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertTriangle, CheckCircle, MessageCircle, Eye, Info } from 'lucide-react';
import "./highlight.css"; // Importando o CSS para o efeito de highlight-pulse

interface ActivityMonitorProps {
  onViewRegistryClick?: () => void;
}

const ActivityMonitor = ({ onViewRegistryClick }: ActivityMonitorProps) => {
  // Estado para contador regressivo
  const [countdown, setCountdown] = useState<number>(237); // 3m 57s
  const [progress, setProgress] = useState<number>(67);
  
  // Atualizar contador a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Formatar o contador regressivo
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="rounded-lg overflow-hidden border border-gray-800 bg-gradient-to-br from-black to-gray-900">
      {/* Header impactante */}
      <div className="bg-red-900 bg-opacity-90 text-white font-bold p-3 border-b border-red-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-red-500 mr-2 animate-pulse">🚨</span>
            <span className="uppercase tracking-wider text-lg">RELATÓRIO DE INVESTIGAÇÃO ATIVO</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs bg-red-700 text-white px-2 py-1 rounded">LIVE</span>
            <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Timeline visual */}
      <div className="p-4 bg-black bg-opacity-60">
        <h2 className="text-white text-xl mb-3 font-bold uppercase tracking-wide">
          🚨 ATIVIDADES SUSPEITAS DETECTADAS
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Última atualização: há 2 min
        </p>
        
        <div className="space-y-4 mb-6">
          {/* Item crítico */}
          <div className="border-l-4 border-red-600 pl-3 py-1 bg-red-900 bg-opacity-20 rounded-r hover:bg-opacity-30 transition-all duration-300">
            <div className="flex items-start">
              <div className="mr-2">⚠️</div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="bg-red-800 text-white text-xs px-2 py-0.5 rounded mr-2">CRÍTICO</span>
                  <span className="text-white font-medium">Troca mensagens suspeita</span>
                </div>
                <div className="text-gray-300 text-sm mt-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                  <span>Shopping Center - 3 dias atrás</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Item alerta */}
          <div className="border-l-4 border-yellow-500 pl-3 py-1 bg-yellow-900 bg-opacity-20 rounded-r hover:bg-opacity-30 transition-all duration-300">
            <div className="flex items-start">
              <div className="mr-2">🟡</div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="bg-yellow-800 text-white text-xs px-2 py-0.5 rounded mr-2">ALERTA</span>
                  <span className="text-white font-medium">Visto online recentemente</span>
                </div>
                <div className="text-gray-300 text-sm mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  <span>Ativo há 2min - Escondendo</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Item info */}
          <div className="border-l-4 border-blue-500 pl-3 py-1 bg-blue-900 bg-opacity-20 rounded-r hover:bg-opacity-30 transition-all duration-300">
            <div className="flex items-start">
              <div className="mr-2">🔵</div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="bg-blue-800 text-white text-xs px-2 py-0.5 rounded mr-2">INFO</span>
                  <span className="text-white font-medium">Online em outra cidade</span>
                </div>
                <div className="text-gray-300 text-sm mt-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                  <span><span className="blur-[3px] hover:blur-none transition-all duration-300 select-none">São Paulo</span> (120km distante)</span>
                </div>
                <div className="text-gray-300 text-sm flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  <span>2 dias atrás</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Item confirmado */}
          <div className="border-l-4 border-green-500 pl-3 py-1 bg-green-900 bg-opacity-20 rounded-r hover:bg-opacity-30 transition-all duration-300">
            <div className="flex items-start">
              <div className="mr-2">✅</div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="bg-green-800 text-white text-xs px-2 py-0.5 rounded mr-2">CONFIRMADO</span>
                  <span className="text-white font-medium">Número verificado no app</span>
                </div>
                <div className="text-gray-300 text-sm mt-1">
                  ✓ Perfil ativo confirmado
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de detalhes expandidos */}
        <div className="border border-red-900 rounded-lg mb-6">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white p-2 font-bold uppercase tracking-wide text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>ATIVIDADE CRÍTICA DETECTADA</span>
          </div>
          <div className="p-4 bg-black bg-opacity-50">
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white ml-2">Troca de mensagens suspeita</span>
              </div>
              <div>
                <span className="text-gray-400">Risco:</span>
                <div className="inline-block ml-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2 inline-block">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-red-500 font-bold ml-1">85% ALTO</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Local:</span>
                <span className="text-white ml-2">Shopping Center <span className="blur-[3px] hover:blur-none transition-all duration-300 select-none">Ibirapuera</span></span>
              </div>
              <div>
                <span className="text-gray-400">Tempo:</span>
                <span className="text-white ml-2">há 2 dias</span>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-2 mt-2" id="oferta-valor">
              <div className="flex items-start">
                <div className="text-blue-400 mr-2">💡</div>
                <div>
                  <span className="text-gray-400 text-xs">Análise IA:</span>
                  <p className="text-white text-sm">Padrão compatível com encontro extraconjugal</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const ofertaValor = document.getElementById('oferta-valor');
                if (ofertaValor) {
                  ofertaValor.scrollIntoView({ behavior: 'smooth' });
                  // Destacar temporariamente a seção
                  ofertaValor.classList.add('highlight-pulse');
                  setTimeout(() => ofertaValor.classList.remove('highlight-pulse'), 3000);
                }
              }}
              className="w-full mt-3 bg-black border border-gray-700 text-white py-2 hover:bg-gray-900 flex items-center justify-center"
            >
              <span>VER DETALHES COMPLETOS</span>
              <Eye className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
        
        {/* Elementos de urgência */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black bg-opacity-60 rounded p-3 border border-gray-800">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Atividades detectadas</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-xl font-bold">7</div>
                <div className="text-gray-500 text-xs">HOJE</div>
              </div>
              <div>
                <div className="flex items-center text-red-500">
                  <span className="text-xl font-bold">23</span>
                  <span className="text-xs ml-1">🔥</span>
                </div>
                <div className="text-gray-500 text-xs">ÚLTIMAS 24H</div>
              </div>
            </div>
          </div>
          
          <div className="bg-black bg-opacity-60 rounded p-3 border border-gray-800">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Próxima verificação</h3>
            <div className="flex items-center">
              <div className="text-white text-2xl font-mono font-bold">{formatCountdown()}</div>
              <div className="ml-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-gray-500 text-xs">ATUALIZAÇÃO AUTOMÁTICA</div>
          </div>
        </div>
        
        {/* Barra de investigação */}
        <div className="bg-black bg-opacity-60 rounded p-3 border border-gray-800 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-xs uppercase tracking-wider">Progresso da investigação</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-gray-400 text-xs text-right">
            Faltam: 2h 15min para relatório final
          </div>
        </div>
        
        <button 
          onClick={onViewRegistryClick}
          className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 border border-red-500"
        >
          VER REGISTRO COMPLETO 🔐
        </button>
      </div>
    </div>
  );
};

export default ActivityMonitor;
