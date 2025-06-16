
import { useState } from 'react';

interface PixPaymentData {
  amount: number;
  description: string;
  customer: {
    name: string;
    document: string;
    phone: string;
    email: string;
  };
  item: {
    title: string;
    price: number;
    quantity: number;
  };
  utm: string;
}

interface PixResponse {
  pixCode: string;
  transactionId: string;
}

interface PaymentStatus {
  ok: boolean;
  status: 'pending' | 'completed';
  data: {
    payment: {
      customer: {
        name: string;
        email: string;
        phone: string;
        document: string;
      };
      item: {
        title: string;
        price: number;
        quantity: number;
        id: string;
      };
      status: 'pending' | 'completed';
      paymentMethod: 'pix';
      amount: number;
      fee: number;
      result: number;
      metadata: {
        pixCode: string;
        pixQrCode: string;
        status: string;
        generatedAt: string;
      };
    };
  };
}

export const usePixApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePix = async (paymentData: PixPaymentData): Promise<PixResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api-production-0feb.up.railway.app/g68', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PIX');
      }

      const data: PixResponse = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (paymentId: string): Promise<PaymentStatus | null> => {
    try {
      const response = await fetch('https://api-production-0feb.up.railway.app/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar pagamento');
      }

      const data: PaymentStatus = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar pagamento');
      return null;
    }
  };

  return {
    generatePix,
    verifyPayment,
    isLoading,
    error,
  };
};
