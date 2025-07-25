import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Contact } from "@/types/client";
import { DynamicCategory } from "@/components/clients/DynamicCategoryManager";
import ClientDetails from "./ClientDetails";
import ClientStats from "./ClientStats";
import ClientActions from "./ClientActions";
import { useUnifiedClientInfo } from "@/hooks/useUnifiedClientInfo";

interface UnifiedClientInfoProps {
  clientData: Contact | null;
  dynamicFields?: {
    basic: DynamicCategory[];
    commercial: DynamicCategory[];
    personalized: DynamicCategory[];
    documents: DynamicCategory[];
  };
  onFieldUpdate?: (fieldId: string, newValue: unknown) => void;
  readOnly?: boolean;
  compact?: boolean;
  showTabs?: string[];
}

const UnifiedClientInfo: React.FC<UnifiedClientInfoProps> = ({
  clientData,
  dynamicFields = {
    basic: [],
    commercial: [],
    personalized: [],
    documents: [],
  },
  onFieldUpdate,
  readOnly = true,
  compact = false,
  showTabs = ["basic", "commercial", "utm", "custom", "docs"],
}) => {
  const {
    activeTab,
    setActiveTab,
    fieldVisibility,
    setFieldVisibility,
    tabsScrollRef,
    customFields,
    consultationStageOptions,
    clientTypeOptions,
    clientSizeOptions,
  } = useUnifiedClientInfo(showTabs);

  const tabConfig = {
    basic: { label: "Básico", icon: "👤" },
    commercial: { label: "Comercial", icon: "💼" },
    utm: { label: "UTM", icon: "📊" },
    custom: { label: "Personalizado", icon: "⚙️" },
    docs: { label: "Arquivos", icon: "📁" }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = 150;
      const newScrollLeft = tabsScrollRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      tabsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleVisibilityChange = (fieldId: string, visible: boolean) => {
    setFieldVisibility(prev => ({
      ...prev,
      [fieldId]: visible,
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <ClientDetails
            clientData={clientData}
            customFields={customFields}
            clientTypeOptions={clientTypeOptions}
            clientSizeOptions={clientSizeOptions}
            fieldVisibility={fieldVisibility}
            onFieldUpdate={onFieldUpdate}
            onVisibilityChange={handleVisibilityChange}
            readOnly={readOnly}
          />
        );
      case "commercial":
        return (
          <ClientStats
            section="commercial"
            clientData={clientData}
            customFields={customFields}
            consultationStageOptions={consultationStageOptions}
            fieldVisibility={fieldVisibility}
            onFieldUpdate={onFieldUpdate}
            onVisibilityChange={handleVisibilityChange}
            readOnly={readOnly}
          />
        );
      case "utm":
        return (
          <ClientStats
            section="utm"
            clientData={clientData}
            customFields={customFields}
            consultationStageOptions={consultationStageOptions}
            fieldVisibility={fieldVisibility}
            onFieldUpdate={onFieldUpdate}
            onVisibilityChange={handleVisibilityChange}
            readOnly={readOnly}
          />
        );
      case "custom":
        return (
          <ClientActions
            section="custom"
            clientData={clientData}
            customFields={customFields}
            onFieldUpdate={onFieldUpdate}
            readOnly={readOnly}
          />
        );
      case "docs":
        return (
          <ClientActions
            section="docs"
            clientData={clientData}
            customFields={customFields}
            onFieldUpdate={onFieldUpdate}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Carousel Tab Navigation */}
      <div className="relative border-b border-border bg-background flex-shrink-0">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-0 z-10 h-full rounded-none shadow-md bg-background/80 backdrop-blur-sm"
          onClick={() => scrollTabs('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Scrollable tabs container */}
        <div
          ref={tabsScrollRef}
          className="flex overflow-x-auto scrollbar-hide mx-8 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-2 min-w-max">
            {showTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium 
                  transition-all duration-200 min-w-[120px]
                  ${activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <span className="mr-2 text-base">
                  {tabConfig[tab as keyof typeof tabConfig]?.icon}
                </span>
                {tabConfig[tab as keyof typeof tabConfig]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 z-10 h-full rounded-none shadow-md bg-background/80 backdrop-blur-sm"
          onClick={() => scrollTabs('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Content with fixed height and scroll */}
      <div className="flex-1 overflow-hidden min-h-0 bg-background">
        <div className="h-full overflow-y-auto bg-background">
          <div className="p-4 bg-background">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedClientInfo;
