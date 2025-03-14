
import React, { useState } from 'react';
import { ScrollText, TrendingUp, Plus, Percent } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';

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
  
  // Calculate metrics
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = assets.length > 0 
    ? assets.reduce((sum, asset) => sum + (asset.performance || 0), 0) / assets.length
    : 0;
  
  // Générer un historique pour les livrets d'épargne
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
    
    // Si aucun livret, retourner des valeurs à zéro
    if (baseValue === 0) {
      return {
        labels,
        datasets: [
          {
            label: 'Solde livrets',
            data: Array(labels.length).fill(0),
            color: '#8B5CF6',
            fill: true,
          }
        ]
      };
    }
    
    // Les livrets ont une croissance stable mais lente
    const generateSteadyIncrease = (steps: number, finalValue: number, avgPerformance: number) => {
      // Calculer la valeur initiale en fonction de la performance moyenne sur la période
      // Pour un taux de performance annuel, sur un timeframe différent
      let initialValue;
      
      // Ajuster le facteur de progression selon la timeframe
      let growthFactor;
      switch (timeFrame) {
        case '1M':
          growthFactor = Math.pow(1 + avgPerformance/100, 1/12); // Performance mensuelle
          break;
        case '3M':
          growthFactor = Math.pow(1 + avgPerformance/100, 1/4); // Performance trimestrielle
          break;
        case '6M':
          growthFactor = Math.pow(1 + avgPerformance/100, 1/2); // Performance semestrielle
          break;
        case '5Y':
          growthFactor = Math.pow(1 + avgPerformance/100, 5); // Performance sur 5 ans
          break;
        case 'ALL':
          growthFactor = Math.pow(1 + avgPerformance/100, 5); // Performance sur "tout"
          break;
        case '1Y':
        default:
          growthFactor = 1 + avgPerformance/100; // Performance annuelle
          break;
      }
      
      initialValue = finalValue / growthFactor;
      
      // Générer une progression constante
      const values = [];
      for (let i = 0; i < steps; i++) {
        const progress = i / (steps - 1);
        // Légère variation pour rendre la courbe plus naturelle
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
          color: '#8B5CF6',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();

  const handleAddSavingsAccount = (newAsset: Omit<Asset, 'id'>) => {
    // Assurer que nous ajoutons un livret d'épargne
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
            <AssetForm 
              onSubmit={handleAddSavingsAccount} 
              onCancel={() => setDialogOpen(false)} 
              defaultType="savings-account" 
              showTypeSelector={false}
            />
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
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
            <div className="text-xs text-muted-foreground mt-1">
              Tous livrets confondus
            </div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {avgPerformance.toFixed(2)}
              <Percent size={16} className="ml-1" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Rendement annuel moyen
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Vos Livrets d'Épargne</h2>
        {assets.length > 0 ? (
          <AssetsList 
            assets={assets} 
            title="Livrets d'épargne" 
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
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
