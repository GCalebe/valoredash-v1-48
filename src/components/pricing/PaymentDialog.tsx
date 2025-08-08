import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield, X } from 'lucide-react';

interface PlanLike {
  id: string;
  name: string;
  billing_period: 'monthly' | 'yearly';
  price: number;
}

interface PaymentDialogProps {
  plan: PlanLike;
  processing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ plan, processing, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Finalizar Assinatura</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-300">Plano</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-300">Período</span>
              <span className="font-medium">{plan.billing_period === 'monthly' ? 'Mensal' : 'Anual'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
              <span className="font-bold">R$ {plan.price.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="cc-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pagamento</label>
              <div id="cc-method" className="flex items-center space-x-2 border rounded-md p-3 bg-white dark:bg-gray-700">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <span>Cartão de Crédito</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cc-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número do Cartão</label>
                <input id="cc-number" type="text" className="w-full p-2 border rounded-md" placeholder="**** **** **** ****" disabled />
              </div>
              <div>
                <label htmlFor="cc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome no Cartão</label>
                <input id="cc-name" type="text" className="w-full p-2 border rounded-md" placeholder="Nome no cartão" disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cc-exp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Validade</label>
                <input id="cc-exp" type="text" className="w-full p-2 border rounded-md" placeholder="MM/AA" disabled />
              </div>
              <div>
                <label htmlFor="cc-cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                <input id="cc-cvv" type="text" className="w-full p-2 border rounded-md" placeholder="***" disabled />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={processing} className="bg-green-600 hover:bg-green-700 text-white">
            {processing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <span className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Finalizar Assinatura
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;


