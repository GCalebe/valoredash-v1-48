import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface UTMCampaignFilterProps {
  selectedCampaign: string;
  onCampaignChange: (campaign: string) => void;
}

const UTMCampaignFilter: React.FC<UTMCampaignFilterProps> = ({
  selectedCampaign,
  onCampaignChange,
}) => {
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from("utm_tracking")
          .select("utm_campaign")
          .not("utm_campaign", "is", null)
          .not("utm_campaign", "eq", "");

        if (error) {
          console.error("Erro ao buscar campanhas:", error);
          return;
        }

        const uniqueCampaigns = [
          ...new Set(data.map((item) => item.utm_campaign)),
        ];
        setCampaigns(uniqueCampaigns);
      } catch (error) {
        console.error("Erro ao buscar campanhas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Campanha:
      </label>
      <Select value={selectedCampaign} onValueChange={onCampaignChange}>
        <SelectTrigger className="w-48">
          <SelectValue
            placeholder={loading ? "Carregando..." : "Todas as campanhas"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as campanhas</SelectItem>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign} value={campaign}>
              {campaign}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UTMCampaignFilter;
