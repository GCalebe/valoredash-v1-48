import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard as CreditCardIcon, QrCode, Banknote, Building, Trash2, Plus } from "lucide-react";
import type { PaymentMethod } from "@/types/pricing";

interface Props {
  paymentMethods: PaymentMethod[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const PaymentMethodsSection: React.FC<Props> = ({ paymentMethods, onAdd, onRemove, onSetDefault }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-semibold">Formas de Pagamento</h3>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </div>

    {paymentMethods.length > 0 ? (
      <div className="grid gap-4">
        {paymentMethods.map(method => (
          <Card key={method.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                {method.type === "credit_card" ? (
                  <CreditCardIcon className="h-8 w-8 text-blue-600" />
                ) : method.type === "pix" ? (
                  <QrCode className="h-8 w-8 text-green-600" />
                ) : method.type === "boleto" ? (
                  <Banknote className="h-8 w-8 text-orange-600" />
                ) : (
                  <Building className="h-8 w-8 text-purple-600" />
                )}
                <div>
                  <p className="font-medium">
                    {method.type === "credit_card"
                      ? `${method.brand} •••• ${method.lastFour || method.last4}`
                      : method.type === "pix"
                      ? "PIX"
                      : method.type === "boleto"
                      ? "Boleto Bancário"
                      : "Transferência Bancária"}
                  </p>
                  {method.type === "credit_card" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expira em {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
                    </p>
                  )}
                  {method.isDefault && (
                    <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Padrão
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => onSetDefault(method.id)}>
                    Definir como padrão
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onRemove(method.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <CreditCardIcon className="h-16 w-16 mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
          Nenhuma forma de pagamento cadastrada
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Adicione uma forma de pagamento para facilitar suas renovações.
        </p>
        <Button className="mt-6" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Forma de Pagamento
        </Button>
      </div>
    )}
  </div>
);

export default PaymentMethodsSection;
