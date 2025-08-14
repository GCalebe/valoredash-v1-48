import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ClientsCard = () => {
  const navigate = useNavigate();
  const [newLeadsToday, setNewLeadsToday] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleClick = () => {
    navigate("/clients");
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetchNewLeadsToday();
  };

  const fetchNewLeadsToday = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNewLeadsToday(0);
        return;
      }
      const today = new Date();
      const start = format(today, "yyyy-MM-dd") + "T00:00:00.000Z";
      const end = format(today, "yyyy-MM-dd") + "T23:59:59.999Z";
      const { data, count, error } = await supabase
        .from("contacts")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .gte("created_at", start)
        .lte("created_at", end);
      if (error) {
        console.error("Erro ao buscar leads do dia:", error);
        setNewLeadsToday(0);
      } else {
        setNewLeadsToday(typeof count === "number" ? count : (data?.length || 0));
      }
    } catch (e) {
      console.error("Erro ao calcular leads do dia:", e);
      setNewLeadsToday(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNewLeadsToday();
  }, [fetchNewLeadsToday]);

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Pipeline
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white hover:bg-white/20 h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <CardDescription className="text-indigo-100 text-xs">
          CRM e gerenciamento
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
            <Users className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-xs">Carregando...</p>
        ) : (
          <div className="space-y-1 text-center">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">Novos:</span>
              <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs">
                {newLeadsToday}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-xs"
        >
          Acessar CRM
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ClientsCard;