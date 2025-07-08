import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Upload } from "lucide-react";
import { useContactsService } from "@/hooks/useContactsService";
import { Contact } from "@/types/client";
import { useCustomFields } from "@/hooks/useCustomFields";
import { DynamicCategory } from "./DynamicCategoryManager";
import TagsManager from "./TagsManager";
import ConsultationStageSelector from "./ConsultationStageSelector";
import { validateClientForm } from "./ClientFormValidation";
import { toast } from "@/hooks/use-toast";
import ValidationErrorAlert from "./ValidationErrorAlert";
import CustomFieldRenderer from "./CustomFieldRenderer";
import CustomFieldManager from "./CustomFieldManager";
import ClientUTMData from "./ClientUTMData";
import { formatCurrency } from "@/utils/formatters";

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newContact: Partial<Contact>;
  setNewContact: (contact: Partial<Contact>) => void;
  handleAddContact: () => Promise<string | undefined>;
}

const AddClientDialog = ({
  isOpen,
  onOpenChange,
  newContact,
  setNewContact,
  handleAddContact,
}: AddClientDialogProps) => {
  const { customFields, fetchCustomFields, saveClientCustomValues } =
    useCustomFields();
  const [customValues, setCustomValues] = useState<{ [fieldId: string]: any }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [activeTab, setActiveTab] = useState("basico");

  // State for dynamic categories per tab
  const [basicCategories, setBasicCategories] = useState<DynamicCategory[]>([]);
  const [commercialCategories, setCommercialCategories] = useState<
    DynamicCategory[]
  >([]);
  const [documentsCategories, setDocumentsCategories] = useState<
    DynamicCategory[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      loadCustomFields();
      console.log("AddClientDialog opened, loading custom fields");
    }
  }, [isOpen]);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      await fetchCustomFields();
      console.log("Custom fields loaded successfully");
    } catch (error) {
      console.error("Error loading custom fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const validation = validateClientForm(newContact);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);

      // Ir para a primeira aba que tem erro
      if (
        validation.errors.name ||
        validation.errors.phone ||
        validation.errors.email
      ) {
        setActiveTab("basico");
      } else if (validation.errors.budget || validation.errors.cpfCnpj) {
        setActiveTab("comercial");
      }

      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros destacados no formulário.",
        variant: "destructive",
      });

      return;
    }

    try {
      // Obter o ID do contato recém-criado
      const newContactId = await handleAddContact();

      // Se temos valores de campos personalizados e um ID de contato, salvá-los
      if (newContactId && Object.keys(customValues).length > 0) {
        try {
          // Converter customValues para o formato esperado pelo saveClientCustomValues
          const customValuesArray = Object.entries(customValues).map(
            ([fieldId, value]) => ({
              fieldId,
              value,
            }),
          );

          await saveClientCustomValues(newContactId, customValuesArray);
        } catch (customFieldError) {
          console.error("Error saving custom fields:", customFieldError);
          // Não interromper o fluxo se falhar ao salvar campos personalizados
        }
      }

      // Reset form and categories
      setCustomValues({});
      setValidationErrors({});
      setActiveTab("basico");
      setBasicCategories([]);
      setCommercialCategories([]);
      setDocumentsCategories([]);

      toast({
        title: "Cliente adicionado",
        description: "Cliente foi adicionado com sucesso ao sistema.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleInputChange = (field: keyof Contact, value: any) => {
    setNewContact({ ...newContact, [field]: value });

    // Limpar erro do campo quando o usuário começa a digitar
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  console.log(
    "AddClientDialog render - isOpen:",
    isOpen,
    "activeTab:",
    activeTab,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 bg-green-500 hover:bg-green-600 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            Adicionar Novo Cliente Náutico
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Preencha as informações para adicionar um novo cliente náutico ao
            seu CRM.
          </DialogDescription>
        </DialogHeader>

        <ValidationErrorAlert errors={validationErrors} />

        {/* Tags Section */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            ADICIONAR TAGS
          </Label>
          <TagsManager
            tags={newContact.tags || []}
            onChange={(tags) => handleInputChange("tags", tags)}
          />
        </div>

        {/* Consultation Stage Section */}
        <div className="mb-6">
          <ConsultationStageSelector
            value={newContact.consultationStage || "Nova consulta"}
            onChange={(stage) => handleInputChange("consultationStage", stage)}
          />
        </div>

        <Tabs defaultValue="principal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="principal"
              onClick={() => setActiveTab("basico")}
            >
              Principal
            </TabsTrigger>
            <TabsTrigger value="utm">UTM</TabsTrigger>
            <TabsTrigger value="midia">Mídia</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="principal" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={newContact.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Digite o nome completo"
                    className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                      validationErrors.name
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                      validationErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    value={newContact.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                      validationErrors.phone
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="address"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    value={newContact.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Rua, número, bairro, cidade, estado"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="responsible-user">Usuário responsável</Label>
                  <Input
                    id="responsible-user"
                    value={newContact.responsibleUser || ""}
                    onChange={(e) =>
                      handleInputChange("responsibleUser", e.target.value)
                    }
                    placeholder="Gabriel Calebe"
                  />
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="clientName"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Nome da Empresa
                  </Label>
                  <Input
                    id="clientName"
                    value={newContact.clientName || ""}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    placeholder="Nome da empresa"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="client-type">Tipo de cliente</Label>
                  <Select
                    value={newContact.clientType || ""}
                    onValueChange={(value) =>
                      handleInputChange("clientType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoa-fisica">
                        Pessoa Física
                      </SelectItem>
                      <SelectItem value="pessoa-juridica">
                        Pessoa Jurídica
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="clientSize"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Tamanho do Cliente
                  </Label>
                  <Select
                    value={newContact.clientSize || ""}
                    onValueChange={(value) =>
                      handleInputChange("clientSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="cpfCnpj"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    CPF/CNPJ
                  </Label>
                  <Input
                    id="cpfCnpj"
                    value={newContact.cpfCnpj || ""}
                    onChange={(e) =>
                      handleInputChange("cpfCnpj", e.target.value)
                    }
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                      validationErrors.cpfCnpj
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors.cpfCnpj && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.cpfCnpj}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="notes"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observações sobre o cliente"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="utm" className="space-y-4">
            {newContact.id ? (
              <ClientUTMData contactId={newContact.id} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <h3 className="text-lg font-medium mb-2">Dados UTM</h3>
                <p>Os dados UTM estarão disponíveis após salvar o cliente.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="midia" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <h3 className="text-lg font-medium mb-2">Mídia</h3>
              <p>Upload de imagens, vídeos ou documentos.</p>
              <Button className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Upload de Mídia
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="produtos" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <h3 className="text-lg font-medium mb-2">Produtos</h3>
              <p>Informações sobre produtos e serviços oferecidos.</p>
            </div>
          </TabsContent>

          <TabsContent value="mais-informacoes" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sales">Venda</Label>
                  <Input
                    id="sales"
                    type="number"
                    value={newContact.sales || ""}
                    onChange={(e) =>
                      handleInputChange("sales", parseFloat(e.target.value))
                    }
                    placeholder="R$ 0"
                  />
                </div>

                <div>
                  <Label htmlFor="client-sector">Setor do cliente</Label>
                  <Select
                    value={newContact.clientSector || ""}
                    onValueChange={(value) =>
                      handleInputChange("clientSector", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="comercio">Comércio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget">Orçamento</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newContact.budget || ""}
                    onChange={(e) =>
                      handleInputChange("budget", parseFloat(e.target.value))
                    }
                    placeholder="R$ 0,00"
                  />
                  {newContact.budget && (
                    <div className="text-sm text-gray-500 mt-1">
                      {formatCurrency(newContact.budget)}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment-method">Método de pagamento</Label>
                  <Select
                    value={newContact.paymentMethod || ""}
                    onValueChange={(value) =>
                      handleInputChange("paymentMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transferencia">
                        Transferência
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-objective">Objetivo do cliente</Label>
                  <Input
                    id="client-objective"
                    value={newContact.clientObjective || ""}
                    onChange={(e) =>
                      handleInputChange("clientObjective", e.target.value)
                    }
                    placeholder="..."
                  />
                </div>

                <div>
                  <Label htmlFor="loss-reason">Motivo de perda</Label>
                  <Select
                    value={newContact.lossReason || ""}
                    onValueChange={(value) =>
                      handleInputChange("lossReason", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preco">Preço</SelectItem>
                      <SelectItem value="timing">Timing</SelectItem>
                      <SelectItem value="concorrencia">Concorrência</SelectItem>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contract-number">Número de contrato</Label>
                  <Input
                    id="contract-number"
                    value={newContact.contractNumber || ""}
                    onChange={(e) =>
                      handleInputChange("contractNumber", e.target.value)
                    }
                    placeholder="..."
                  />
                </div>

                <div>
                  <Label htmlFor="contract-date">Data de contrato</Label>
                  <Input
                    id="contract-date"
                    type="date"
                    value={newContact.contractDate || ""}
                    onChange={(e) =>
                      handleInputChange("contractDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="payment">Pagamento</Label>
                  <Select
                    value={newContact.payment || ""}
                    onValueChange={(value) =>
                      handleInputChange("payment", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
            * Campos obrigatórios
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Adicionar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
