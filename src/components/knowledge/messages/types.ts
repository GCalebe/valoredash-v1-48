import React from 'react';

export interface MessageConditions {
  userType: string;
  stage: string;
}

export interface AIMessage {
  id: string;
  name: string;
  content: string;
  category: string;
  conditions: MessageConditions;
  isActive: boolean;
  usage: number;
  effectiveness: number;
}

export interface SchedulingStage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}


