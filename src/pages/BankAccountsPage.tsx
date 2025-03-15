
import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, AlertCircle } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface BankAccountsPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
  totalWealth?: number;
}

const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ 
  assets, 
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset,
  totalWealth = 0
}) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  // Calculate metrics
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  // Calculate the ratio of bank accounts to total wealth
  const bankAccountRatio = totalWealth > 0 ? (totalValue / totalWealth) * 100 : 0;
  
  // Determine if the ratio is too high (greater than 30%)
  const isRatioTooHigh = bankAccountRatio > 30;
  
  // Generate chart data
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
    
    // Si aucun compte, retourner des valeurs à zéro
    if (baseValue === 0) {
      return {
        labels,
        datasets: [
          {
            label: 'Solde comptes',
            data: Array(labels.length).fill(0),
            color: '#4338CA',
            fill: true,
          }
        ]
      };
    }
    
    // Les comptes bancaires ont une volatilité plus faible que les investissements
    const volatilityFactor = timeFrame === '1M' ? 0.02 : 
                             timeFrame === '3M' ? 0.03 : 
                             timeFrame === '6M' ? 0.04 : 
                             timeFrame === '5Y' ? 0.1 : 
                             timeFrame === 'ALL' ? 0.15 : 0.05; // 1Y
    
    const generateValues = (steps: number, finalValue: number, volatility: number) => {
      // Pour les comptes bancaires, nous voulons une tendance plus plate mais avec des pics/creux
      let currentValue = finalValue * (1 - Math.random() * volatility * 0.5);
      const result = [currentValue];
      
      for (let i = 1; i < steps - 1; i++) {
        const randomChange = (Math.random() * 2 - 1) * volatility * finalValue * 0.1;
        currentValue = Math.max(0, currentValue + randomChange);
        result.push(currentValue);
      }
      
      // Ajouter la valeur finale
      result.push(finalValue);
      
      return result.map(val => Math.round(val));
    };
    
    const values = generateValues(labels.length, baseValue, volatilityFactor);
    
    return {
      labels,
      datasets: [
        {
          label: 'Solde comptes',
          data: values,
          color: '#4338CA',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();

  const handleAddAccount = (newAsset: Omit<Asset, 'id'>) => {
    // Assurer que nous ajoutons un compte bancaire
    const bankAccount = {
      ...newAsset,
      type: 'bank-account' as AssetType
    };
    
    onAddAsset(bankAccount);
    setDialogOpen(false);
    
    toast({
      title: "Compte bancaire ajouté",
      description: `${newAsset.name} a été ajouté à vos comptes`,
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
        title: "Compte bancaire modifié",
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
        title: "Compte bancaire supprimé",
        description: "Le compte a été supprimé de votre patrimoine",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comptes Bancaires</h1>
          <p className="text-muted-foreground">Gérez vos comptes courants et suivez leur évolution</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={16} />
              <span>Ajouter un compte</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un compte bancaire</DialogTitle>
            </DialogHeader>
            <AssetForm 
              onSubmit={handleAddAccount} 
              onCancel={() => setDialogOpen(false)} 
              defaultType="bank-account" 
              showTypeSelector={false}
            />
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier un compte bancaire</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <AssetForm 
                onSubmit={handleUpdateAsset}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingAsset(null);
                }}
                defaultType="bank-account"
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Tous comptes confondus
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de Comptes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Comptes bancaires actifs
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Ratio Liquidité/Patrimoine</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Ce ratio indique la proportion de votre patrimoine global qui est disponible en liquidités sur vos comptes bancaires. 
                      Un ratio trop élevé (&gt;30%) suggère que vous pourriez diversifier ou investir davantage.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isRatioTooHigh ? 'text-amber-600' : 'text-green-600'}`}>
              {formatPercentage(bankAccountRatio)}
            </div>
            <div className={`text-xs mt-1 ${isRatioTooHigh ? 'text-amber-600' : 'text-green-600'}`}>
              {isRatioTooHigh ? (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Trop de liquidités, pensez à investir
                </span>
              ) : (
                "Ratio équilibré"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Évolution du solde</CardTitle>
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
        <h2 className="text-xl font-semibold mb-4">Vos Comptes Bancaires</h2>
        {assets.length > 0 ? (
          <AssetsList 
            assets={assets} 
            title="Comptes bancaires" 
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun compte bancaire dans votre patrimoine
            </p>
            <button 
              className="wealth-btn wealth-btn-primary"
              onClick={() => setDialogOpen(true)}
            >
              Ajouter votre premier compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccountsPage;
