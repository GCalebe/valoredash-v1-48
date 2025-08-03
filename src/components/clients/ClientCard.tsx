import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit2,
  MessageSquare,
  Phone,
  Mail,
  ShipWheel,
  Tag,
  AlertCircle,
  DollarSign,
  Target,
} from "lucide-react";
import { Contact } from "@/types/client";
import { cn } from "@/lib/utils";
import { useClientNavigation } from "@/utils/navigationUtils";

interface ClientCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
  displayConfig?: {
    showTags?: boolean;
    showConsultationStage?: boolean;
    showCommercialInfo?: boolean;
    showCustomFields?: boolean;
    isCompact?: boolean;
  };
  className?: string;
  dragHandleProps?: any;
  draggableProps?: any;
  innerRef?: (element: HTMLElement | null) => void;
  snapshot?: any;
}

// Mapeamento de cores para os estágios do kanban
const STAGE_HEADER_COLORS: { [key: string]: string } = {
  Entraram: "text-gray-500 dark:text-gray-400",
  Conversaram: "text-blue-500 dark:text-blue-400",
  Agendaram: "text-yellow-500 dark:text-yellow-400",
  Compareceram: "text-green-500 dark:text-green-400",
  Negociaram: "text-purple-500 dark:text-purple-400",
  Postergaram: "text-orange-500 dark:text-orange-400",
  Converteram: "text-emerald-500 dark:text-emerald-400",
};
const DEFAULT_STAGE_HEADER_COLOR = "text-gray-500 dark:text-gray-400";

// Função para obter a cor da borda com base no estágio
function getBorderLeftColor(stage: string) {
  if (STAGE_HEADER_COLORS[stage]?.includes("blue")) return "#3b82f6";
  if (STAGE_HEADER_COLORS[stage]?.includes("yellow")) return "#f59e0b";
  if (STAGE_HEADER_COLORS[stage]?.includes("green")) return "#22c55e";
  if (STAGE_HEADER_COLORS[stage]?.includes("purple")) return "#8b5cf6";
  if (STAGE_HEADER_COLORS[stage]?.includes("orange")) return "#f97316";
  if (STAGE_HEADER_COLORS[stage]?.includes("emerald")) return "#10b981";
  return "#64748b";
}

export const ClientCard: React.FC<ClientCardProps> = ({
  contact,
  onClick,
  onEditClick,
  displayConfig = {
    showTags: true,
    showConsultationStage: true,
    showCommercialInfo: false,
    showCustomFields: false,
    isCompact: false,
  },
  className,
  dragHandleProps,
  draggableProps,
  innerRef,
  snapshot,
}) => {
  const { navigateToClientChat } = useClientNavigation();
  const { isCompact } = displayConfig;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const chatId = contact.sessionId || contact.id.toString();
    navigateToClientChat(chatId);
  };

  const isCancelledProject =
    contact.consultationStage === "Projeto cancelado – perdido";

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={cn("px-1", className)}
    >
      <Card
        className={cn(
          `mb-2 cursor-pointer transition-all duration-200 hover:shadow-lg dark:hover:shadow-blue-500/20 relative border-l-4`,
          snapshot?.isDragging ? "shadow-xl rotate-1 scale-105" : "shadow-sm",
          "bg-card",
          isCancelledProject && "relative overflow-hidden",
        )}
        style={{
          borderLeftColor: getBorderLeftColor(contact.kanbanStage),
        }}
        onClick={() => onClick(contact)}
      >
        {/* Red overlay for cancelled projects */}
        {isCancelledProject && (
          <div className="absolute inset-0 bg-red-500/10 z-10 pointer-events-none" />
        )}

        <CardContent
          className={cn("p-3 text-sm relative z-30", isCompact && "py-1.5")}
        >
          <div className="flex items-start justify-between mb-1">
            <span
              className="font-semibold text-gray-800 dark:text-gray-100 pr-2 truncate"
              title={contact.name}
            >
              {contact.name}
            </span>
          </div>

          {/* Tags */}
          {displayConfig.showTags &&
            contact.tags &&
            contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                <Tag className="h-3 w-3 text-gray-500 mr-1" />
                {contact.tags.slice(0, isCompact ? 1 : 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs py-0 px-1"
                  >
                    {tag}
                  </Badge>
                ))}
                {contact.tags.length > (isCompact ? 1 : 3) && (
                  <Badge variant="outline" className="text-xs py-0 px-1">
                    +{contact.tags.length - (isCompact ? 1 : 3)}
                  </Badge>
                )}
              </div>
            )}

          {/* Consultation Stage */}
          {displayConfig.showConsultationStage && contact.consultationStage && (
            <div className="flex items-center gap-1 mb-2 text-xs">
              <AlertCircle className="h-3 w-3 text-gray-500" />
              <span
                className={cn(
                  "text-gray-600 dark:text-gray-300",
                  isCancelledProject &&
                    "text-red-600 dark:text-red-400 font-medium",
                )}
              >
                {contact.consultationStage}
              </span>
            </div>
          )}

          {/* Client Name/Company */}
          {!isCompact && contact.clientName && (
            <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
              <ShipWheel className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{contact.clientName}</span>
            </div>
          )}

          {/* Commercial Info */}
          {displayConfig.showCommercialInfo && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2 text-xs">
              {contact.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    R$ {contact.budget.toFixed(2)}
                  </span>
                </div>
              )}
              {contact.clientObjective && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">
                    {contact.clientObjective}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-col gap-1 mb-2">
            {contact.phone && (
              <div className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  {contact.phone}
                </span>
              </div>
            )}
            {!isCompact && contact.email && (
              <div className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300 truncate">
                  {contact.email}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {contact.lastContact}
            </div>
            <div className="flex items-center -mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(contact);
                    }}
                    className="h-7 w-7"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar Cliente</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWhatsAppClick}
                    className="h-7 w-7"
                  >
                    <svg
                      className="h-4 w-4 text-green-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Abrir no WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCard;
