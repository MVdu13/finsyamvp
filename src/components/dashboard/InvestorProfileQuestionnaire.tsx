import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export type InvestorProfileType = 'conservative' | 'balanced' | 'aggressive' | 'offensive';

interface QuestionOption {
  label: string;
  score: number;
}

interface Question {
  text: string;
  options: QuestionOption[];
  image?: string;
}

interface InvestorProfileQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (profile: InvestorProfileType) => void;
  currentProfile: InvestorProfileType;
}

const questions: Question[] = [
  {
    text: "Quelle expérience avez-vous ?",
    options: [
      { label: "Je n'ai jamais investi et je n'y connais rien", score: 1 },
      { label: "Je n'ai jamais investi mais j'ai quelques bases", score: 2 },
      { label: "J'ai déjà investi mais rarement ou j'ai arrêté", score: 3 },
      { label: "J'investis depuis des années et je suis expérimenté", score: 4 }
    ]
  },
  {
    text: "Dans combien d'années aimeriez-vous retirer la majorité de votre investissement ?",
    options: [
      { label: "Moins de 2 ans", score: 1 },
      { label: "2 à 5 ans", score: 2 },
      { label: "6 à 10 ans", score: 3 },
      { label: "Plus de 10 ans", score: 4 }
    ]
  },
  {
    text: "Vous avez investi 1000€, au bout de 3 ans vous êtes à -30% donc à 700€, votre horizon d'investissement est de 10 ans, qu'auriez vous tendance à faire ?",
    options: [
      { label: "Je vends tout", score: 1 },
      { label: "Je laisse courir", score: 2 },
      { label: "Je réinvestis", score: 4 }
    ]
  },
  {
    text: "Objectif prioritaire d'investissement",
    options: [
      { label: "Payer des vacances", score: 1 },
      { label: "Projet immobilier", score: 2 },
      { label: "Complément de retraite", score: 4 },
      { label: "Valoriser mon capital à long terme", score: 4 },
      { label: "Autonomie financière", score: 5 }
    ]
  },
  {
    text: "Avec quelle fluctuation de portefeuille vous vous sentiriez le plus à l'aise ?",
    options: [
      { label: "Portefeuille 1", score: 1 },
      { label: "Portefeuille 2", score: 2 },
      { label: "Portefeuille 3", score: 3 },
      { label: "Portefeuille 4", score: 4 }
    ],
    image: "/lovable-uploads/3c23bfd9-d2f5-4e2f-895e-f6b7c372e546.png"
  }
];

const getProfileFromScore = (score: number): InvestorProfileType => {
  if (score <= 8) return 'conservative';
  if (score <= 13) return 'balanced';
  if (score <= 17) return 'aggressive';
  return 'offensive';
};

const getProfileLabel = (profile: InvestorProfileType): string => {
  switch (profile) {
    case 'conservative':
      return 'Prudent';
    case 'balanced':
      return 'Équilibré';
    case 'aggressive':
      return 'Dynamique';
    case 'offensive':
      return 'Offensif';
    default:
      return 'Équilibré';
  }
};

const InvestorProfileQuestionnaire: React.FC<InvestorProfileQuestionnaireProps> = ({
  isOpen,
  onClose,
  onUpdateProfile,
  currentProfile
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [selectedOption, setSelectedOption] = useState<number>(-1);

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(newAnswers[currentQuestionIndex + 1]);
    } else {
      const totalScore = newAnswers.reduce((sum, score) => sum + (score !== -1 ? questions[newAnswers.indexOf(score)].options[score].score : 0), 0);
      const newProfile = getProfileFromScore(totalScore);
      
      onUpdateProfile(newProfile);
      
      toast({
        title: "Profil mis à jour",
        description: `Votre profil investisseur est maintenant: ${getProfileLabel(newProfile)}`,
      });
      
      handleReset();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1]);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers(Array(questions.length).fill(-1));
    setSelectedOption(-1);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
    
    toast({
      title: "Mise à jour annulée",
      description: "La mise à jour du profil investisseur a été annulée.",
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const canGoNext = selectedOption !== -1;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Questionnaire de Profil Investisseur
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} sur {questions.length}</span>
            <span>Profil actuel: {getProfileLabel(currentProfile)}</span>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
            
            {currentQuestion.image && (
              <div className="my-4 flex justify-center">
                <img 
                  src={currentQuestion.image} 
                  alt="Fluctuations de portefeuille" 
                  className="max-w-full rounded-md border border-gray-200"
                />
              </div>
            )}
            
            <RadioGroup value={selectedOption.toString()} onValueChange={(value) => setSelectedOption(parseInt(value))}>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={index.toString()} 
                      id={`option-${index}`}
                    />
                    <label htmlFor={`option-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="mr-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Quitter le questionnaire
          </Button>
          
          <div className="space-x-2">
            <Button 
              type="button" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={!canGoNext}
            >
              {isLastQuestion ? (
                <>
                  Terminer et mettre à jour
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorProfileQuestionnaire;
