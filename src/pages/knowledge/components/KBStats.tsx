// @ts-nocheck
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Eye, Globe, FileText } from 'lucide-react';

interface KBStatsProps {
  stats?: { categories: number; views: number; languages: number; articles: number } | null;
}

const KBStats: React.FC<KBStatsProps> = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorias</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.categories}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visualizações</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.views}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Idiomas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.languages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Artigos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.articles}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KBStats;


