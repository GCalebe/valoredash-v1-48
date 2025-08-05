// @ts-nocheck
import { useEffect, useState } from "react";
import {
  useAIPersonalityQuery,
  useCreateAIPersonalityMutation,
  useUpdateAIPersonalityMutation,
} from "@/hooks/useAIPersonalityQuery";
import { useToast } from "@/hooks/use-toast";

export interface PersonalitySettings {
  name: string;
  description: string;
  tone: string;
  personality: string;
  formality: number;
  empathy: number;
  creativity: number;
  directness: number;
  greeting: string;
  farewell: string;
  specialInstructions: string;
  maxResponses: number;
  messageSize: number;
  responseTime: number;
  audioResponse: boolean;
  responseCreativity: number;
  useEmojis: boolean;
  responseSpeed: 'immediate' | 'thoughtful' | 'detailed';
  contextAware: boolean;
  continuousLearning: boolean;
  responseLength: 'concise' | 'moderate' | 'detailed';
}

const defaultSettings: PersonalitySettings = {
  name: "Assistente Virtual",
  description: "Assistente especializado em atendimento ao cliente",
  tone: "amigável e profissional",
  personality:
    "Sou um assistente virtual dedicado a ajudar você da melhor forma possível. Tenho conhecimento sobre nossos serviços e estou sempre disposto a esclarecer suas dúvidas.",
  formality: 3,
  empathy: 4,
  creativity: 3,
  directness: 3,
  greeting: "Olá! Como posso ajudá-lo hoje?",
  farewell: "Foi um prazer ajudá-lo! Tenha um ótimo dia!",
  specialInstructions:
    "Sempre seja cordial e tente resolver o problema do cliente. Se não souber algo, admita e direcione para um humano.",
  maxResponses: 3,
  messageSize: 3,
  responseTime: 3,
  audioResponse: false,
  responseCreativity: 3,
  useEmojis: false,
  responseSpeed: 'thoughtful',
  contextAware: true,
  continuousLearning: true,
  responseLength: 'moderate',
};

export const useAIPersonalityForm = () => {
  const { toast } = useToast();
  const { data: personalityData, isLoading, error } = useAIPersonalityQuery();
  const createMutation = useCreateAIPersonalityMutation();
  const updateMutation = useUpdateAIPersonalityMutation();

  const [settings, setSettings] =
    useState<PersonalitySettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (personalityData && personalityData.length > 0) {
      const data = personalityData[0];
      setSettings({
        name: data.name || defaultSettings.name,
        description: data.description || defaultSettings.description,
        tone: data.tone || defaultSettings.tone,
        personality: data.personality_type || defaultSettings.personality,
        formality: data.temperature || defaultSettings.formality,
        empathy: defaultSettings.empathy,
        creativity: defaultSettings.creativity,
        directness: defaultSettings.directness,
        greeting: data.greeting_message || defaultSettings.greeting,
        farewell: defaultSettings.farewell,
        specialInstructions:
          data.custom_instructions || defaultSettings.specialInstructions,
        maxResponses: data.max_tokens || defaultSettings.maxResponses,
        messageSize: defaultSettings.messageSize,
        responseTime: defaultSettings.responseTime,
        audioResponse: defaultSettings.audioResponse,
        responseCreativity: defaultSettings.responseCreativity,
        useEmojis: defaultSettings.useEmojis,
        responseSpeed: defaultSettings.responseSpeed,
        contextAware: defaultSettings.contextAware,
        continuousLearning: defaultSettings.continuousLearning,
        responseLength: defaultSettings.responseLength,
      });
    }
  }, [personalityData]);

  const handleInputChange = (
    field: keyof PersonalitySettings,
    value: string | number | boolean,
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSliderChange = (
    field: keyof PersonalitySettings,
    values: number[],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: values[0] }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const personalityPayload = {
        name: settings.name,
        description: settings.description,
        tone: settings.tone,
        personality_type: settings.personality,
        temperature: settings.formality,
        greeting_message: settings.greeting,
        custom_instructions: settings.specialInstructions,
        max_tokens: settings.maxResponses,
        is_active: true,
      };

      if (personalityData && personalityData.length > 0) {
        await updateMutation.mutateAsync({
          id: personalityData[0].id,
          ...personalityPayload,
        });
      } else {
        await createMutation.mutateAsync(personalityPayload);
      }

      toast({
        title: "Configurações salvas",
        description: "A personalidade da IA foi atualizada com sucesso!",
      });

      setHasChanges(false);
    } catch {
      toast({
        title: "Erro ao salvar",
        description:
          "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const getSliderLabel = (value: number) => {
    const labels = ["Muito Baixo", "Baixo", "Moderado", "Alto", "Muito Alto"];
    return labels[value - 1] || "Moderado";
  };

  return {
    settings,
    setSettings,
    isLoading,
    error,
    hasChanges,
    handleInputChange,
    handleSliderChange,
    handleSave,
    handleReset,
    reset: handleReset,
    getSliderLabel,
    createMutation,
    updateMutation,
  };
};
