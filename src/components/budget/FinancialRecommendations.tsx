
import React from 'react';
import { DollarSign, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const availableAfterProjects = Math.max(0, availableAfterExpenses - monthlyProjectsContribution);
  
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Analyse financière</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <p className="text-green-700">
            Avec un revenu mensuel de <strong>{formatCurrency(totalIncome)}</strong> et des dépenses de <strong>{formatCurrency(totalExpenses)}</strong>, 
            vous pouvez épargner <strong>{formatCurrency(availableAfterExpenses)}</strong> par mois.
          </p>
          
          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-md">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-blue-700">
              <strong>{formatCurrency(monthlyProjectsContribution)}</strong> sont actuellement alloués à vos projets financiers, 
              ce qui vous laisse <strong>{formatCurrency(availableAfterProjects)}</strong> disponibles pour d'autres usages.
            </p>
          </div>
          
          {needsSecurityCushion ? (
            <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-md">
              <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-amber-700">
                <p className="font-semibold">Priorité : Compléter votre matelas de sécurité</p>
                <p>Il est recommandé de constituer un matelas de sécurité complet avant d'investir davantage. 
                Vous devriez allouer une partie de votre épargne disponible ({formatCurrency(availableAfterProjects)}) à cet objectif prioritaire.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-emerald-50 p-3 rounded-md">
              <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div className="text-emerald-700">
                <p className="font-semibold">Recommandation d'investissement</p>
                <p>Votre matelas de sécurité étant suffisant, vous pouvez investir jusqu'à <strong>{formatCurrency(availableForInvestment)}</strong> par mois 
                pour faire fructifier votre patrimoine sur le long terme.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialRecommendations;
