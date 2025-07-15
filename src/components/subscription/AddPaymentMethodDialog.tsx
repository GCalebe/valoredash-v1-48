import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CreditCard as CreditCardIcon,
  QrCode,
  Banknote,
  Building,
} from "lucide-react";
import type { PaymentMethod } from "@/types/pricing";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: Omit<PaymentMethod, "id">;
  setPaymentMethod: React.Dispatch<React.SetStateAction<Omit<PaymentMethod, "id">>>;
  onAdd: () => void;
}

const AddPaymentMethodDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  paymentMethod,
  setPaymentMethod,
  onAdd,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
        <DialogDescription>
          Escolha uma forma de pagamento para suas renovações.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={paymentMethod.type === "credit_card" ? "default" : "outline"}
            className="flex flex-col items-center justify-center h-24 p-4"
            onClick={() => setPaymentMethod({ ...paymentMethod, type: "credit_card" })}
          >
            <CreditCardIcon className="h-8 w-8 mb-2" />
            <span>Cartão de Crédito</span>
          </Button>
          <Button
            variant={paymentMethod.type === "pix" ? "default" : "outline"}
            className="flex flex-col items-center justify-center h-24 p-4"
            onClick={() => setPaymentMethod({ ...paymentMethod, type: "pix" })}
          >
            <QrCode className="h-8 w-8 mb-2" />
            <span>PIX</span>
          </Button>
          <Button
            variant={paymentMethod.type === "boleto" ? "default" : "outline"}
            className="flex flex-col items-center justify-center h-24 p-4"
            onClick={() => setPaymentMethod({ ...paymentMethod, type: "boleto" })}
          >
            <Banknote className="h-8 w-8 mb-2" />
            <span>Boleto Bancário</span>
          </Button>
          <Button
            variant={paymentMethod.type === "bank_transfer" ? "default" : "outline"}
            className="flex flex-col items-center justify-center h-24 p-4"
            onClick={() =>
              setPaymentMethod({
                ...paymentMethod,
                type: "bank_transfer",
              })
            }
          >
            <Building className="h-8 w-8 mb-2" />
            <span>Transferência Bancária</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="default-payment"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={paymentMethod.isDefault}
            onChange={(e) =>
              setPaymentMethod({ ...paymentMethod, isDefault: e.target.checked })
            }
          />
          <label htmlFor="default-payment" className="text-sm text-gray-700 dark:text-gray-300">
            Definir como forma de pagamento padrão
          </label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onAdd}>Adicionar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddPaymentMethodDialog;
