
import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface FinancialRecommendationsProps {
  totalIncome: number;
  totalExpenses: number;
  availableAfterExpenses: number;
  monthlyProjectsContribution: number;
  availableForInvestment: number;
  needsSecurityCushion: boolean;
}

const FinancialRecommendations: React.FC<FinancialRecommendationsProps> = ({
  totalIncome,
  totalExpenses,
  availableAfterExpenses,
  monthlyProjectsContribution,
  availableForInvestment,
  needsSecurityCushion
}) => {
  return (
    <div className="wealth-card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Recommandations personnalisées</h3>
          <p className="text-sm text-muted-foreground">Basées sur votre profil financier actuel</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span>Analyse financière</span>
          </h4>
          <p className="text-sm text-green-700">
            Vous avez un revenu total de {formatCurrency(totalIncome)}, des dépenses de {formatCurrency(totalExpenses)}, 
            vous pouvez épargner et investir {formatCurrency(availableAfterExpenses)} par mois. 
            En prenant en compte vos projets, vous devez mettre {formatCurrency(monthlyProjectsContribution)} de côté par mois, 
            donc vous pouvez investir seulement {formatCurrency(availableForInvestment)} par mois.
            {needsSecurityCushion && " Attention, vous devez compléter votre matelas de sécurité avant d'investir."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialRecommendations;
