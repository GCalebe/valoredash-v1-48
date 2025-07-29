import React from "react";
import { cn } from "@/lib/utils";

interface ResizeHandleProps {
  onMouseDown: () => void;
  className?: string;
}

export default function ResizeHandle({ onMouseDown, className }: ResizeHandleProps) {
  return (
    <div 
      className={cn(
        "w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors",
        className
      )}
      onMouseDown={onMouseDown}
    />
  );
}