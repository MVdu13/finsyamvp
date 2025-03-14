
import React from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
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
          <p className="text-sm text-green-700 mb-2">
            Avec un revenu mensuel de {formatCurrency(totalIncome)} et des dépenses de {formatCurrency(totalExpenses)}, 
            vous pouvez épargner {formatCurrency(availableAfterExpenses)} par mois.
          </p>
          <p className="text-sm text-green-700 mb-2">
            De cette somme, {formatCurrency(monthlyProjectsContribution)} sont alloués à vos projets financiers, 
            ce qui vous laisse {formatCurrency(Math.max(0, availableAfterExpenses - monthlyProjectsContribution))} disponibles.
          </p>
          {needsSecurityCushion && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <strong>Priorité :</strong> Vous devez compléter votre matelas de sécurité avant d'investir.
            </p>
          )}
          {!needsSecurityCushion && availableForInvestment > 0 && (
            <p className="text-sm text-green-700">
              <strong>Recommandation :</strong> Vous pouvez investir jusqu'à {formatCurrency(availableForInvestment)} par mois.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialRecommendations;
