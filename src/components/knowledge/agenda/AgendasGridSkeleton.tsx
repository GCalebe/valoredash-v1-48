// @ts-nocheck
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const AgendasGridSkeleton: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="flex flex-col justify-between bg-background border">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
              </div>
              <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-6"></div>
            <div className="flex items-center gap-6">
              <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex justify-end gap-2 bg-muted/30 p-3 mt-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 flex-1 bg-muted rounded animate-pulse"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AgendasGridSkeleton;


