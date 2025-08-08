import React from 'react';
import { Activity, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const StatItem = ({ icon, value, label, bgColor }: { icon: React.ReactNode; value: number; label: string; bgColor: string }) => (
  <div className={`${bgColor} p-4 rounded-lg text-center`}>
    {icon}
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

export const ConnectionStats = ({ stats }: { stats: { messages: number; contacts: number; chats: number } }) => (
  <div className="grid grid-cols-3 gap-2">
    <StatItem icon={<Activity className="h-5 w-5 mx-auto mb-1 text-blue-400" />} value={stats.messages} label="Mensagens" bgColor="bg-blue-900/20" />
    <StatItem icon={<Activity className="h-5 w-5 mx-auto mb-1 text-purple-400" />} value={stats.contacts} label="Contatos" bgColor="bg-purple-900/20" />
    <StatItem icon={<Activity className="h-5 w-5 mx-auto mb-1 text-green-400" />} value={stats.chats} label="Chats" bgColor="bg-green-900/20" />
  </div>
);

export const ConnectingContent = ({ connection }: { connection: any }) => (
  <>
    <div className="flex items-center text-yellow-400 text-sm">
      <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></div>
      {connection.statusText}
    </div>
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
      <div className="bg-blue-900/30 p-2 rounded-full">
        <Activity className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <p className="font-medium">{connection.lastActivity}</p>
        <p className="text-xs text-gray-400">Última atividade</p>
      </div>
    </div>
    <ConnectionStats stats={connection.stats} />
  </>
);

export const ConnectedContent = ({ connection }: { connection: any }) => (
  <>
    <div className="flex items-center text-green-400 text-sm">
      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
      {connection.statusText}
    </div>
    {connection.phone && (
      <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
        <div className="bg-green-900/30 p-2 rounded-full">
          <Smartphone className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <p className="font-medium">{connection.phone}</p>
          <p className="text-xs text-gray-400">{connection.phoneLabel}</p>
        </div>
      </div>
    )}
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
      <div className="bg-blue-900/30 p-2 rounded-full">
        <Activity className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <p className="font-medium">{connection.lastActivity}</p>
        <p className="text-xs text-gray-400">Última atividade</p>
      </div>
    </div>
    <ConnectionStats stats={connection.stats} />
    {Array.isArray(connection.badges) && (
      <div className="flex flex-wrap gap-2">
        {connection.badges.map((badge: any) => (
          <Badge
            key={`${badge.text}-${badge.color}`}
            className={`
              ${badge.color === 'blue' ? 'bg-blue-900/30 text-blue-400' : ''}
              ${badge.color === 'purple' ? 'bg-purple-900/30 text-purple-400' : ''}
              ${badge.color === 'green' ? 'bg-green-900/30 text-green-400' : ''}
            `}
          >
            {badge.text}
          </Badge>
        ))}
      </div>
    )}
  </>
);


