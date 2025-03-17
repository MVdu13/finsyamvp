
import React, { useState, useEffect } from 'react';
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
import InvestmentAccountForm from '@/components/assets/form/InvestmentAccountForm';
import StockForm from '@/components/assets/form/StockForm';
import InvestmentAccountsList from '@/components/assets/InvestmentAccountsList';
import DeleteConfirmationDialog from '@/components/assets/DeleteConfirmationDialog';

interface StocksPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

const StocksPage: React.FC<StocksPageProps> = ({ 
  assets, 
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset
}) => {
  const { toast } = useToast();
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAccountDialogOpen, setEditAccountDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingAccount, setEditingAccount] = useState<Asset | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0); // New state for forcing refresh
  
  // Filter stocks and investment accounts
  const stocks = assets.filter(asset => asset.type === 'stock');
  const investmentAccounts = assets.filter(asset => asset.type === 'investment-account');
  
  // Log when accounts change to debug
  useEffect(() => {
    console.log('StocksPage - Investment Accounts:', investmentAccounts);
  }, [investmentAccounts]);

  // Calculate metrics
  const stocksWithoutAccounts = stocks.filter(stock => !stock.parentAccountId);
  const totalValue = stocks.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = stocks.length > 0 
    ? stocks.reduce((sum, asset) => sum + (asset.performance || 0), 0) / stocks.length
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
  
  // Calculate absolute performance change in currency
  const firstValue = chartData.datasets[0].data[0] || 0;
  const lastValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1] || 0;
  const absoluteGrowth = lastValue - firstValue;
  
  // Get time period text based on selected timeframe
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

  const handleAddStock = (newStock: Omit<Asset, 'id'>) => {
    // Call the parent's onAddAsset function
    onAddAsset(newStock);
    setStockDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Action ajoutée",
      description: `${newStock.name} a été ajouté à votre portefeuille`,
    });
  };
  
  const handleAddAccount = (newAccount: Omit<Asset, 'id'>) => {
    const addedAccount = {
      ...newAccount,
      id: Date.now().toString(), // Temporary ID to use before it's officially added
    };
    
    onAddAsset(newAccount);
    setAccountDialogOpen(false);
    
    toast({
      title: "Compte créé",
      description: `${newAccount.name} a été ajouté à vos comptes d'investissement`,
    });

    // Force refresh to update the accounts list
    setForceRefresh(prev => prev + 1);

    // If we're creating an account before adding a stock, open the stock dialog with this account selected
    if (selectedAccountId === 'new') {
      // Set the selected account ID to the new account's ID
      setSelectedAccountId(addedAccount.id);
      
      // Wait for the state to update with the new account
      setTimeout(() => {
        setStockDialogOpen(true);
      }, 100);
    }
  };
  
  const handleEditStock = (asset: Asset) => {
    setEditingAsset(asset);
    setEditDialogOpen(true);
  };

  const handleEditAccount = (account: Asset) => {
    setEditingAccount(account);
    setEditAccountDialogOpen(true);
  };

  const handleUpdateStock = (updatedAsset: Omit<Asset, 'id'>) => {
    if (editingAsset && onUpdateAsset) {
      onUpdateAsset(editingAsset.id, updatedAsset);
      toast({
        title: "Action modifiée",
        description: `${updatedAsset.name} a été mise à jour`,
      });
      setEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleUpdateAccount = (updatedAccount: Omit<Asset, 'id'>) => {
    if (editingAccount && onUpdateAsset) {
      onUpdateAsset(editingAccount.id, updatedAccount);
      toast({
        title: "Compte modifié",
        description: `${updatedAccount.name} a été mis à jour`,
      });
      setEditAccountDialogOpen(false);
      setEditingAccount(null);
    }
  };

  const handleDeleteAsset = () => {
    if (assetToDelete && onDeleteAsset) {
      // Check if this is an account with stocks
      const isAccount = assetToDelete.type === 'investment-account';
      if (isAccount) {
        // Find all stocks in this account
        const stocksInAccount = stocks.filter(stock => stock.parentAccountId === assetToDelete.id);
        
        // Delete all stocks in this account first
        stocksInAccount.forEach(stock => {
          onDeleteAsset(stock.id);
        });
      }
      
      // Delete the asset
      onDeleteAsset(assetToDelete.id);
      
      toast({
        title: isAccount ? "Compte supprimé" : "Action supprimée",
        description: isAccount 
          ? "Le compte et tous ses titres ont été supprimés" 
          : "L'action a été supprimée de votre portefeuille",
      });
      
      setAssetToDelete(null);
    }
  };

  const handleAddStockToAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setStockDialogOpen(true);
  };

  const handleCreateNewAccount = () => {
    setSelectedAccountId('new');
    setStockDialogOpen(false);
    setAccountDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille d'Actions et ETF</h1>
          <p className="text-muted-foreground">Gérez vos actions et ETF et suivez leur performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogTrigger asChild>
              <button className="wealth-btn wealth-btn-secondary flex items-center gap-2">
                <Plus size={16} />
                <span>Nouveau compte</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un compte d'investissement</DialogTitle>
              </DialogHeader>
              <InvestmentAccountForm 
                onSubmit={handleAddAccount} 
                onCancel={() => setAccountDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
            <DialogTrigger asChild>
              <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
                <Plus size={16} />
                <span>Ajouter une action/ETF</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter une action/ETF</DialogTitle>
              </DialogHeader>
              <StockForm 
                onSubmit={handleAddStock} 
                onCancel={() => setStockDialogOpen(false)} 
                accounts={investmentAccounts}
                onCreateNewAccount={handleCreateNewAccount}
                selectedAccountId={selectedAccountId}
                forceRefresh={forceRefresh}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Edit Stock Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier une action/ETF</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <StockForm 
                onSubmit={handleUpdateStock}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingAsset(null);
                }}
                initialValues={editingAsset}
                isEditing={true}
                accounts={investmentAccounts}
                onCreateNewAccount={handleCreateNewAccount}
                forceRefresh={forceRefresh}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Edit Account Dialog */}
        <Dialog open={editAccountDialogOpen} onOpenChange={setEditAccountDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier un compte d'investissement</DialogTitle>
            </DialogHeader>
            {editingAccount && (
              <InvestmentAccountForm 
                onSubmit={handleUpdateAccount}
                onCancel={() => {
                  setEditAccountDialogOpen(false);
                  setEditingAccount(null);
                }}
                initialValues={editingAccount}
                isEditing={true}
              />
            )}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre d'Actions/ETF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stocks.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Titres en portefeuille
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-xl font-bold",
              absoluteGrowth >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {absoluteGrowth >= 0 ? (
                <>Vous avez gagné {formatCurrency(Math.abs(absoluteGrowth))}</>
              ) : (
                <>Vous avez perdu {formatCurrency(Math.abs(absoluteGrowth))}</>
              )}
            </div>
            <div className={cn(
              "text-xs mt-1",
              absoluteGrowth >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {getTimePeriodText()} ({avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}%)
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
        <h2 className="text-xl font-semibold mb-4">Vos comptes d'investissement</h2>
        {investmentAccounts.length > 0 ? (
          <InvestmentAccountsList 
            accounts={investmentAccounts}
            stocks={stocks}
            onEditAccount={handleEditAccount}
            onDeleteAccount={(id) => setAssetToDelete(assets.find(a => a.id === id) || null)}
            onAddStock={handleAddStockToAccount}
            onEditStock={handleEditStock}
            onDeleteStock={(id) => setAssetToDelete(assets.find(a => a.id === id) || null)}
          />
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun compte d'investissement dans votre portefeuille
            </p>
            <button 
              className="wealth-btn wealth-btn-primary"
              onClick={() => setAccountDialogOpen(true)}
            >
              Créer votre premier compte d'investissement
            </button>
          </div>
        )}
      </div>

      {stocksWithoutAccounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Actions et ETF sans compte associé</h2>
          <AssetsList 
            assets={stocksWithoutAccounts} 
            title="" 
            onEdit={handleEditStock}
            onDelete={(id) => setAssetToDelete(assets.find(a => a.id === id) || null)}
          />
        </div>
      )}

      <DeleteConfirmationDialog 
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onConfirm={handleDeleteAsset}
        assetName={assetToDelete?.name}
      />
    </div>
  );
};

export default StocksPage;
