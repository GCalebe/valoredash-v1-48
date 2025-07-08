import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface UTMDeviceFilterProps {
  selectedDevice: string;
  onDeviceChange: (device: string) => void;
}

const UTMDeviceFilter: React.FC<UTMDeviceFilterProps> = ({
  selectedDevice,
  onDeviceChange,
}) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const { data, error } = await supabase
          .from("utm_tracking")
          .select("device_type")
          .not("device_type", "is", null)
          .not("device_type", "eq", "");

        if (error) {
          console.error("Erro ao buscar dispositivos:", error);
          return;
        }

        const uniqueDevices = [
          ...new Set(data.map((item) => item.device_type)),
        ];
        setDevices(uniqueDevices);
      } catch (error) {
        console.error("Erro ao buscar dispositivos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Dispositivo:
      </label>
      <Select value={selectedDevice} onValueChange={onDeviceChange}>
        <SelectTrigger className="w-40">
          <SelectValue
            placeholder={loading ? "Carregando..." : "Todos os dispositivos"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os dispositivos</SelectItem>
          {devices.map((device) => (
            <SelectItem key={device} value={device}>
              {device}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UTMDeviceFilter;
