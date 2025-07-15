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
import { Check, X } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import type { UserSubscription } from "@/types/pricing";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  subscription: UserSubscription | null;
}

const CancelSubscriptionDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onConfirm,
  subscription,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cancelar Assinatura</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja cancelar sua assinatura?
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p className="mb-4">Ao cancelar sua assinatura:</p>
        <ul className="space-y-2 mb-4">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>
              Você continuará tendo acesso até o final do período atual (
              {formatDate(subscription?.currentPeriodEnd || "")})
            </span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Não haverá mais cobranças após este período</span>
          </li>
          <li className="flex items-start">
            <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <span>
              Você perderá acesso a todas as IAs após o término do período
            </span>
          </li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400">
          Você pode reativar sua assinatura a qualquer momento antes do término
          do período atual.
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Voltar
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Confirmar Cancelamento
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default CancelSubscriptionDialog;
