
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface FieldVisibilityControlProps {
  fieldId: string;
  fieldLabel: string;
  isVisible: boolean;
  onVisibilityChange: (fieldId: string, visible: boolean) => void;
  readOnly?: boolean;
}

const FieldVisibilityControl: React.FC<FieldVisibilityControlProps> = ({
  fieldId,
  fieldLabel,
  isVisible,
  onVisibilityChange,
  readOnly = false,
}) => {
  if (readOnly) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      <Checkbox
        id={`visibility-${fieldId}`}
        checked={isVisible}
        onCheckedChange={(checked) => onVisibilityChange(fieldId, checked as boolean)}
        className="h-3 w-3"
      />
      <Label htmlFor={`visibility-${fieldId}`} className="text-xs cursor-pointer">
        {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      </Label>
    </div>
  );
};

export default FieldVisibilityControl;
