
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export type InvestorProfileType = 'conservative' | 'balanced' | 'aggressive';

interface QuestionOption {
  label: string;
  score: number;
}

interface Question {
  text: string;
  options: QuestionOption[];
}

interface InvestorProfileQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (profile: InvestorProfileType) => void;
  currentProfile: InvestorProfileType;
}

const questions: Question[] = [
  {
    text: "Quelle est votre horizon d'investissement ?",
    options: [
      { label: "Moins de 2 ans", score: 1 },
      { label: "2 à 5 ans", score: 3 },
      { label: "5 à 10 ans", score: 4 },
      { label: "Plus de 10 ans", score: 6 }
    ]
  },
  {
    text: "Comment réagiriez-vous si vos investissements perdaient 20% de leur valeur en une semaine ?",
    options: [
      { label: "Je vendrais tout immédiatement pour éviter d'autres pertes", score: 1 },
      { label: "Je vendrais une partie de mes investissements", score: 2 },
      { label: "J'attendrais sans rien faire", score: 4 },
      { label: "J'en profiterais pour investir davantage", score: 6 }
    ]
  },
  {
    text: "Quel est votre objectif principal en matière d'investissement ?",
    options: [
      { label: "Préserver mon capital, même si les rendements sont faibles", score: 1 },
      { label: "Un équilibre entre croissance et sécurité", score: 3 },
      { label: "Maximiser la croissance à long terme, malgré la volatilité", score: 5 },
      { label: "Rechercher des rendements élevés, même avec des risques importants", score: 6 }
    ]
  },
  {
    text: "Quelle part de votre patrimoine total êtes-vous prêt à investir sur les marchés financiers ?",
    options: [
      { label: "Moins de 10%", score: 1 },
      { label: "Entre 10% et 25%", score: 2 },
      { label: "Entre 25% et 50%", score: 4 },
      { label: "Plus de 50%", score: 6 }
    ]
  },
  {
    text: "Avez-vous déjà une expérience en matière d'investissement ?",
    options: [
      { label: "Aucune expérience", score: 1 },
      { label: "Quelques connaissances de base", score: 2 },
      { label: "Une bonne compréhension des marchés financiers", score: 4 },
      { label: "Une expérience approfondie avec différents types d'investissements", score: 6 }
    ]
  }
];

const getProfileFromScore = (score: number): InvestorProfileType => {
  if (score <= 10) return 'conservative';
  if (score <= 20) return 'balanced';
  return 'aggressive';
};

const getProfileLabel = (profile: InvestorProfileType): string => {
  switch (profile) {
    case 'conservative':
      return 'Prudent';
    case 'balanced':
      return 'Équilibré';
    case 'aggressive':
      return 'Dynamique';
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
    // Save the current answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Pre-select the previous answer if it exists
      setSelectedOption(newAnswers[currentQuestionIndex + 1]);
    } else {
      // We're at the last question, calculate the profile
      const totalScore = newAnswers.reduce((sum, score) => sum + (score !== -1 ? questions[newAnswers.indexOf(score)].options[score].score : 0), 0);
      const newProfile = getProfileFromScore(totalScore);
      
      // Update the profile
      onUpdateProfile(newProfile);
      
      // Show success message
      toast({
        title: "Profil mis à jour",
        description: `Votre profil investisseur est maintenant: ${getProfileLabel(newProfile)}`,
      });
      
      // Close the questionnaire
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
