
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PortfolioRebalancer from '@/components/tools/PortfolioRebalancer';

const PortfolioRebalancerPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Outil de Rebalancement de Portefeuille</h1>
        <p className="text-muted-foreground">
          Cet outil vous aide à rebalancer votre portefeuille d'investissement en calculant les ajustements nécessaires 
          pour atteindre votre allocation cible. Ajoutez vos actifs, définissez les allocations cibles, 
          et obtenez des recommandations d'achat et de vente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votre Portefeuille</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioRebalancer />
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioRebalancerPage;
