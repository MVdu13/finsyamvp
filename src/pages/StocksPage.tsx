
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, TrendingUp, TrendingDown, Plus, Filter } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';

interface StocksPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
}

const StocksPage: React.FC<StocksPageProps> = ({ assets, onAddAsset }) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  
  // Calculate metrics
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = assets.length > 0 
    ? assets.reduce((sum, asset) => sum + asset.performance, 0) / assets.length
    : 0;
  
  // Générer un historique cohérent basé sur la valeur totale actuelle et la timeframe
  const generateChartData = () => {
    const baseValue = totalValue > 0 ? totalValue : 0;
    
    // Déterminer le nombre de points de données selon la timeframe
    let numDataPoints;
    let labels;
    
    // Créer des dates basées sur la timeframe sélectionnée
    const currentDate = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    switch (timeFrame) {
      case '1M':
        // Jours du mois
        numDataPoints = 30;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1));
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '3M':
        // Points hebdomadaires sur 3 mois
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 7);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '6M':
        // Bi-hebdomadaire sur 6 mois
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 14);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '5Y':
        // Mensuel sur 5 ans
        numDataPoints = 60;
        labels = Array.from({ length: Math.min(numDataPoints, 24) }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (Math.min(numDataPoints, 24) - i - 1));
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        });
        break;
      case 'ALL':
        // Annuel
        numDataPoints = 5;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setFullYear(currentDate.getFullYear() - (numDataPoints - i - 1));
          return date.getFullYear().toString();
        });
        break;
      case '1Y':
      default:
        // Mensuel sur 1 an
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (numDataPoints - i - 1));
          return months[date.getMonth()];
        });
        break;
    }
    
    // Si aucune action, retourner des valeurs à zéro
    if (baseValue === 0) {
      return {
        labels,
        datasets: [
          {
            label: 'Valeur actions',
            data: Array(labels.length).fill(0),
            color: '#2563EB',
            fill: true,
          }
        ]
      };
    }
    
    // Générer des données variables selon la timeframe
    const volatilityFactor = timeFrame === '1M' ? 0.05 : 
                             timeFrame === '3M' ? 0.08 : 
                             timeFrame === '6M' ? 0.12 : 
                             timeFrame === '5Y' ? 0.25 : 
                             timeFrame === 'ALL' ? 0.35 : 0.15; // 1Y
    
    const generateRandomWalk = (steps: number, finalValue: number, volatility: number) => {
      // Commencer avec une valeur initiale inférieure à la valeur finale pour simuler une croissance
      let initialValue = finalValue * (1 - Math.random() * volatility);
      const result = [initialValue];
      
      for (let i = 1; i < steps - 1; i++) {
        // Calculer la prochaine valeur avec une tendance vers la valeur finale
        const progress = i / (steps - 1);
        const trend = initialValue + progress * (finalValue - initialValue);
        
        // Ajouter une variation aléatoire autour de la tendance
        const randomFactor = 1 + (Math.random() * 2 - 1) * volatility * (1 - progress);
        result.push(trend * randomFactor);
      }
      
      // Ajouter la valeur finale
      result.push(finalValue);
      
      return result.map(val => Math.round(val));
    };
    
    const values = generateRandomWalk(labels.length, baseValue, volatilityFactor);
    
    return {
      labels,
      datasets: [
        {
          label: 'Valeur actions',
          data: values,
          color: '#2563EB',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();

  const handleAddStock = (newStock: Omit<Asset, 'id'>) => {
    // Make sure we're adding a stock asset
    const stockAsset = {
      ...newStock,
      type: 'stock' as AssetType
    };
    
    // Call the parent's onAddAsset function
    onAddAsset(stockAsset);
    setDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Action ajoutée",
      description: `${newStock.name} a été ajouté à votre portefeuille`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille d'Actions</h1>
          <p className="text-muted-foreground">Gérez vos actions et suivez leur performance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={16} />
              <span>Ajouter une action</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter une action</DialogTitle>
            </DialogHeader>
            <AssetForm 
              onSubmit={handleAddStock} 
              onCancel={() => setDialogOpen(false)} 
              defaultType="stock" 
              showTypeSelector={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valeur Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className={cn(
              "text-xs flex items-center mt-1",
              avgPerformance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {avgPerformance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}% cette année</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre d'Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Titres en portefeuille
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              avgPerformance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Performance globale du portefeuille
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Évolution de la valeur</CardTitle>
            <CardDescription>
              {timeFrame === '1Y' ? 'Sur les 12 derniers mois' : 
               timeFrame === '1M' ? 'Sur le dernier mois' : 
               timeFrame === '3M' ? 'Sur les 3 derniers mois' : 
               timeFrame === '6M' ? 'Sur les 6 derniers mois' : 
               timeFrame === '5Y' ? 'Sur les 5 dernières années' : 
               'Historique complet'}
            </CardDescription>
          </div>
          <TimeFrameSelector 
            selectedTimeFrame={timeFrame} 
            onTimeFrameChange={setTimeFrame} 
          />
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChartComponent data={chartData} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vos Actions</h2>
        {assets.length > 0 ? (
          <AssetsList assets={assets} title="Actions" />
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucune action dans votre portefeuille
            </p>
            <button 
              className="wealth-btn wealth-btn-primary"
              onClick={() => setDialogOpen(true)}
            >
              Ajouter votre première action
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StocksPage;
