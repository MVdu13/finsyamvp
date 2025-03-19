import React, { useState } from 'react';
import { ScrollText, TrendingUp, Plus, Percent } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import DonutChart from '@/components/charts/DonutChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import { cn } from '@/lib/utils';
import SavingsAccountForm from '@/components/assets/form/SavingsAccountForm';

interface SavingsAccountsPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

const SavingsAccountsPage: React.FC<SavingsAccountsPageProps> = ({ 
  assets, 
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset
}) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = assets.length > 0 
    ? assets.reduce((sum, asset) => sum + (asset.performance || 0), 0) / assets.length
    : 0;
  
  const annualInterestEarnings = assets.reduce((sum, asset) => {
    const interestRate = asset.performance || 0;
    const annualInterest = (asset.value * interestRate) / 100;
    return sum + annualInterest;
  }, 0);
  
  const generateChartData = () => {
    const baseValue = totalValue > 0 ? totalValue : 0;
    
    let numDataPoints;
    let labels;
    
    const currentDate = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    switch (timeFrame) {
      case '1M':
        numDataPoints = 30;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1));
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '3M':
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 7);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '6M':
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 14);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '5Y':
        numDataPoints = 60;
        labels = Array.from({ length: Math.min(numDataPoints, 24) }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (Math.min(numDataPoints, 24) - i - 1));
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        });
        break;
      case 'ALL':
        numDataPoints = 5;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setFullYear(currentDate.getFullYear() - (numDataPoints - i - 1));
          return date.getFullYear().toString();
        });
        break;
      case '1Y':
      default:
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (numDataPoints - i - 1));
          return months[date.getMonth()];
        });
        break;
    }
    
    if (baseValue === 0) {
      return {
        labels,
        datasets: [
          {
            label: 'Solde livrets',
            data: Array(labels.length).fill(0),
            color: '#FA5003',
            fill: true,
          }
        ]
      };
    }
    
    const generateSteadyIncrease = (steps: number, finalValue: number, avgPerformance: number) => {
      let initialValue;
      let growthFactor;
      
      switch (timeFrame) {
        case '1M':
          growthFactor = Math.pow(1 + avgPerformance/100, 1/12);
          break;
        case '3M':
          growthFactor = Math.pow(1 + avgPerformance/100, 1/4);
          break;
        case '6M':
          growthFactor = Math.pow(1 + avgPerformance/100, 1/2);
          break;
        case '5Y':
          growthFactor = Math.pow(1 + avgPerformance/100, 5);
          break;
        case 'ALL':
          growthFactor = Math.pow(1 + avgPerformance/100, 5);
          break;
        case '1Y':
        default:
          growthFactor = 1 + avgPerformance/100;
          break;
      }
      
      initialValue = finalValue / growthFactor;
      
      const values = [];
      for (let i = 0; i < steps; i++) {
        const progress = i / (steps - 1);
        const randomNoise = 1 + (Math.random() * 0.005 - 0.0025);
        values.push(initialValue + (finalValue - initialValue) * progress * randomNoise);
      }
      
      return values.map(val => Math.round(val));
    };
    
    const values = generateSteadyIncrease(labels.length, baseValue, avgPerformance);
    
    return {
      labels,
      datasets: [
        {
          label: 'Solde livrets',
          data: values,
          color: '#FA5003',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();
  
  const firstValue = chartData.datasets[0].data[0] || 0;
  const lastValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1] || 0;
  const absoluteGrowth = lastValue - firstValue;
  
  const getTimePeriodText = () => {
    switch (timeFrame) {
      case '1M': return 'sur le dernier mois';
      case '3M': return 'sur les 3 derniers mois';
      case '6M': return 'sur les 6 derniers mois';
      case '5Y': return 'sur les 5 dernières années';
      case 'ALL': return 'sur la période complète';
      case '1Y': 
      default: return 'sur les 12 derniers mois';
    }
  };

  const handleAddSavingsAccount = (newAsset: Omit<Asset, 'id'>) => {
    const savingsAccount = {
      ...newAsset,
      type: 'savings-account' as AssetType
    };
    
    onAddAsset(savingsAccount);
    setDialogOpen(false);
    
    toast({
      title: "Livret ajouté",
      description: `${newAsset.name} a été ajouté à vos livrets d'épargne`,
    });
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setEditDialogOpen(true);
  };

  const handleUpdateAsset = (updatedAsset: Omit<Asset, 'id'>) => {
    if (editingAsset && onUpdateAsset) {
      onUpdateAsset(editingAsset.id, updatedAsset);
      toast({
        title: "Livret modifié",
        description: `${updatedAsset.name} a été mis à jour`,
      });
      setEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (onDeleteAsset) {
      onDeleteAsset(id);
      toast({
        title: "Livret supprimé",
        description: "Le livret a été supprimé de votre patrimoine",
      });
    }
  };

  const generateDistributionChartData = () => {
    if (assets.length === 0) {
      return {
        labels: ['Aucun livret'],
        values: [1],
        colors: ['#e5e7eb'],
      };
    }

    const sortedAssets = [...assets].sort((a, b) => b.value - a.value);
    
    const colors = [
      '#8B5CF6',
      '#EC4899',
      '#3B82F6',
      '#10B981',
      '#F97316',
      '#A855F7',
      '#14B8A6',
      '#6366F1',
    ];

    return {
      labels: sortedAssets.map(asset => asset.name),
      values: sortedAssets.map(asset => asset.value),
      colors: sortedAssets.map((_, index) => colors[index % colors.length]),
    };
  };

  const distributionChartData = generateDistributionChartData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Livrets d'Épargne</h1>
          <p className="text-muted-foreground">Gérez vos livrets et suivez leur évolution</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={16} />
              <span>Ajouter un livret</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un livret d'épargne</DialogTitle>
            </DialogHeader>
            <SavingsAccountForm 
              onSubmit={handleAddSavingsAccount} 
              onCancel={() => setDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier un livret d'épargne</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <AssetForm 
                onSubmit={handleUpdateAsset}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingAsset(null);
                }}
                defaultType="savings-account"
                initialValues={editingAsset}
                isEditing={true}
                showTypeSelector={false}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Épargne Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de Livrets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Livrets d'épargne actifs
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Intérêts Annuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(annualInterestEarnings)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Gains d'intérêts par an avec vos livrets
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Évolution de l'épargne</CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Répartition des livrets</CardTitle>
            <CardDescription>
              Distribution par livret d'épargne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <DonutChart data={distributionChartData} height={260} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vos Livrets d'Épargne</h2>
        {assets.length > 0 ? (
          <AssetsList 
            assets={assets} 
            title="Livrets d'épargne" 
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
            hideViewAllButton={true}
          />
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun livret d'épargne dans votre patrimoine
            </p>
            <button 
              className="wealth-btn wealth-btn-primary"
              onClick={() => setDialogOpen(true)}
            >
              Ajouter votre premier livret
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsAccountsPage;
