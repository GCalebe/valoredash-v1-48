import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const questions = [
  "Qual o horário de funcionamento?",
  "Como fazer um agendamento?",
  "Quais são os valores dos serviços?",
  "Onde vocês estão localizados?",
  "Como posso entrar em contato?",
];

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onSelect }) => (
  <Card>
    <CardHeader>
      <CardTitle>Perguntas Sugeridas</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {questions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            className="w-full text-left justify-start"
            onClick={() => onSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SuggestedQuestions;

