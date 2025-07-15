import { Card, CardContent } from "@/components/ui/card";
import { Link, Wifi, MessageSquare, Activity } from "lucide-react";
import React from "react";

interface Stats {
  totalInstances: number;
  connectedInstances: number;
  activeChats: number;
  totalMessages: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards = ({ stats }: StatsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Instâncias</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInstances}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <Link className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conectadas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.connectedInstances}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chats Ativos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeChats}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Mensagens</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
            <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default StatsCards;
