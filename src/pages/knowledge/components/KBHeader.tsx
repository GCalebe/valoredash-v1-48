// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShipWheel } from 'lucide-react';

interface KBHeaderProps {
  brandName: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  userDisplayName?: string | null;
  onBack: () => void;
  onSignOut: () => void;
}

const KBHeader: React.FC<KBHeaderProps> = ({ brandName, logoUrl, primaryColor, secondaryColor, userDisplayName, onBack, onSignOut }) => {
  return (
    <header className="text-white shadow-md transition-colors duration-300 rounded-b-xl" style={{ backgroundColor: primaryColor }}>
      <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20 focus-visible:ring-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <ShipWheel className="h-8 w-8" style={{ color: secondaryColor }} />
          )}
          <h1 className="text-2xl font-bold">{brandName}</h1>
          <span className="text-lg ml-2">Base de Conhecimento</span>
        </div>
        <div className="flex items-center gap-3">
          {userDisplayName && (
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {userDisplayName}
            </Badge>
          )}
          <Button variant="outline" onClick={onSignOut} className="border-white text-white bg-transparent hover:bg-white/20" style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default KBHeader;


