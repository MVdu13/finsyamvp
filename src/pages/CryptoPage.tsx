import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Plus, ChevronDown, Trash2 } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CryptoDetailsDialog from '@/components/assets/CryptoDetailsDialog';
import StockDeleteConfirmationDialog from '@/components/assets/StockDeleteConfirmationDialog';

interface CryptoPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => Asset | null | undefined;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

const CryptoPage: React.FC<CryptoPageProps> = ({
  assets,
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset
}) => {
  const {
    toast
  } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cryptoDetailsDialogOpen, setCryptoDetailsDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<Asset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string, name: string, hasAssets: boolean }>({ id: '', name: '', hasAssets: false });

  const cryptoAccounts = assets.filter(asset => asset.type === 'crypto-account');
  const cryptoAssets = assets.filter(asset => asset.type === 'crypto');
  const totalValue = cryptoAssets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = cryptoAssets.length > 0 ? cryptoAssets.reduce((sum, asset) => sum + (asset.performance || 0), 0) / cryptoAssets.length : 0;
  const absoluteGrowth = useMemo(() => {
    return totalValue * (avgPerformance / 100);
  }, [totalValue, avgPerformance]);

  const groupedCryptos = cryptoAccounts.map(account => {
    const accountCryptos = cryptoAssets.filter(crypto => crypto.cryptoAccountId === account.id);
    const accountValue = accountCryptos.reduce((sum, crypto) => sum + crypto.value, 0);
    return {
      account,
      cryptos: accountCryptos,
      totalValue: accountValue
    };
  });

  const unassignedCryptos = cryptoAssets.filter(crypto => !crypto.cryptoAccountId);
  if (unassignedCryptos.length > 0) {
    const unassignedValue = unassignedCryptos.reduce((sum, crypto) => sum + crypto.value, 0);
    groupedCryptos.push({
      account: {
        id: 'unassigned',
        name: 'Non catégorisées',
        type: 'crypto-account' as AssetType,
        value: unassignedValue,
        performance: 0
      },
      cryptos: unassignedCryptos,
      totalValue: unassignedValue
    });
  }

  groupedCryptos.sort((a, b) => b.totalValue - a.totalValue);

  const generateChartData = () => {
    const baseValue = totalValue > 0 ? totalValue : 0;
    let numDataPoints;
    let labels;
    const currentDate = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    switch (timeFrame) {
      case '1M':
        numDataPoints = 30;
        labels = Array.from({
          length: numDataPoints
        }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1));
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '3M':
        numDataPoints = 12;
        labels = Array.from({
          length: numDataPoints
        }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 7);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '6M':
        numDataPoints = 12;
        labels = Array.from({
          length: numDataPoints
        }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 14);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '5Y':
        numDataPoints = 60;
        labels = Array.from({
          length: Math.min(numDataPoints, 24)
        }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (Math.min(numDataPoints, 24) - i - 1));
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        });
        break;
      case 'ALL':
        numDataPoints = 5;
        labels = Array.from({
          length: numDataPoints
        }, (_, i) => {
          const date = new Date();
          date.setFullYear(currentDate.getFullYear() - (numDataPoints - i - 1));
          return date.getFullYear().toString();
        });
        break;
      case '1Y':
      default:
        numDataPoints = 12;
        labels = Array.from({
          length: numDataPoints
        }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (numDataPoints - i - 1));
          return months[date.getMonth()];
        });
        break;
    }

    if (baseValue === 0) {
      return {
        labels,
        datasets: [{
          label: 'Valeur crypto',
          data: Array(labels.length).fill(0),
          color: '#FA5003',
          fill: true
        }]
      };
    }

    const volatilityFactor = timeFrame === '1M' ? 0.15 : timeFrame === '3M' ? 0.25 : timeFrame === '6M' ? 0.4 : timeFrame === '5Y' ? 0.7 : timeFrame === 'ALL' ? 0.9 : 0.5;

    const generateRandomWalk = (steps: number, finalValue: number, volatility: number) => {
      let initialValue = finalValue * (1 - Math.random() * volatility);
      const result = [initialValue];
      for (let i = 1; i < steps - 1; i++) {
        const progress = i / (steps - 1);
        const trend = initialValue + progress * (finalValue - initialValue);
        const randomFactor = 1 + (Math.random() * 2 - 1) * volatility * (1 - progress);
        result.push(trend * randomFactor);
      }
      result.push(finalValue);
      return result.map(val => Math.round(val));
    };

    const values = generateRandomWalk(labels.length, baseValue, volatilityFactor);
    return {
      labels,
      datasets: [{
        label: 'Valeur crypto',
        data: values,
        color: '#FA5003',
        fill: true
      }]
    };
  };

  const chartData = generateChartData();

  const handleAddCrypto = (newCrypto: Omit<Asset, 'id'>) => {
    if (newCrypto.type === 'crypto-account') {
      const cryptoAccount = {
        ...newCrypto,
        type: 'crypto-account' as AssetType,
        value: 0
      };
      const addedAccount = onAddAsset(cryptoAccount);
      setDialogOpen(false);
      toast({
        title: "Compte crypto ajouté",
        description: `${newCrypto.name} a été ajouté à votre portefeuille`
      });
      return addedAccount;
    } else {
      const cryptoAsset = {
        ...newCrypto,
        type: 'crypto' as AssetType
      };
      const addedAsset = onAddAsset(cryptoAsset);
      setDialogOpen(false);
      toast({
        title: "Crypto ajoutée",
        description: `${newCrypto.name} a été ajoutée à votre portefeuille`
      });
      return addedAsset;
    }
  };

  const handleAddAccount = () => {
    setDialogOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setEditDialogOpen(true);
  };

  const handleUpdateAsset = (updatedAsset: Omit<Asset, 'id'>) => {
    if (editingAsset && onUpdateAsset) {
      onUpdateAsset(editingAsset.id, updatedAsset);
      toast({
        title: "Crypto modifiée",
        description: `${updatedAsset.name} a été mise à jour`
      });
      setEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (onDeleteAsset) {
      onDeleteAsset(id);
      toast({
        title: "Crypto supprimée",
        description: "La cryptomonnaie a été supprimée de votre portefeuille"
      });
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    const accountToRemove = cryptoAccounts.find(account => account.id === accountId);
    const accountCryptos = cryptoAssets.filter(crypto => crypto.cryptoAccountId === accountId);
    
    if (accountToRemove) {
      setAccountToDelete({
        id: accountId,
        name: accountToRemove.name,
        hasAssets: accountCryptos.length > 0
      });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteAccount = () => {
    if (onDeleteAsset && accountToDelete.id) {
      onDeleteAsset(accountToDelete.id);
      
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès"
      });
      
      setDeleteDialogOpen(false);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedCrypto(asset);
    setCryptoDetailsDialogOpen(true);
  };

  const getTimePeriodText = () => {
    switch (timeFrame) {
      case '1M':
        return 'sur le dernier mois';
      case '3M':
        return 'sur les 3 derniers mois';
      case '6M':
        return 'sur les 6 derniers mois';
      case '5Y':
        return 'sur les 5 dernières années';
      case 'ALL':
        return 'sur la période complète';
      case '1Y':
      default:
        return 'sur les 12 derniers mois';
    }
  };

  const renderCryptoGroup = (group: {
    account: Asset;
    cryptos: Asset[];
    totalValue: number;
  }) => {
    return <div key={group.account.id} className="space-y-4">
        <Collapsible>
          <div className="rounded-lg border p-4 mb-4">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {group.account.name} {group.account.cryptoPlatform && `(${group.account.cryptoPlatform})`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {group.cryptos.length} cryptomonnaies
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(group.totalValue)}</div>
                  </div>
                  {group.account.id !== 'unassigned' && <button onClick={e => {
                  e.stopPropagation();
                  handleDeleteAccount(group.account.id);
                }} className="p-1.5 rounded-full hover:bg-muted transition-colors text-red-500" title="Supprimer le compte">
                      <Trash2 size={16} />
                    </button>}
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              {group.cryptos.length > 0 ? <AssetsList assets={group.cryptos} title="" showActions={false} onEdit={handleEditAsset} onDelete={handleDeleteAsset} onAssetClick={handleAssetClick} /> : <div className="text-center py-6 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    Aucune cryptomonnaie dans ce compte
                  </p>
                  <button className="wealth-btn mt-2" onClick={() => setDialogOpen(true)}>
                    Ajouter une cryptomonnaie
                  </button>
                </div>}
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>;
  };

  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille Crypto</h1>
          <p className="text-muted-foreground">Gérez vos cryptomonnaies et suivez leur performance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={16} />
              <span>Ajouter une crypto</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              
            </DialogHeader>
            <AssetForm onSubmit={handleAddCrypto} onCancel={() => setDialogOpen(false)} defaultType="crypto" showTypeSelector={false} cryptoAccounts={cryptoAccounts} onAddAccount={handleAddCrypto} existingCryptos={cryptoAssets} />
          </DialogContent>
        </Dialog>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier une cryptomonnaie</DialogTitle>
            </DialogHeader>
            {editingAsset && <AssetForm onSubmit={handleUpdateAsset} onCancel={() => {
            setEditDialogOpen(false);
            setEditingAsset(null);
          }} defaultType="crypto" initialValues={editingAsset} isEditing={true} showTypeSelector={false} cryptoAccounts={cryptoAccounts} existingCryptos={cryptoAssets} />}
          </DialogContent>
        </Dialog>

        <CryptoDetailsDialog isOpen={cryptoDetailsDialogOpen} onClose={() => setCryptoDetailsDialogOpen(false)} crypto={selectedCrypto} />
        
        <StockDeleteConfirmationDialog 
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDeleteAccount}
          stockName={accountToDelete.name}
          assetType="crypto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valeur Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className={cn("text-xs flex items-center mt-1", avgPerformance >= 0 ? "text-green-600" : "text-red-600")}>
              {avgPerformance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}% cette année</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nombre de Cryptos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cryptoAssets.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Cryptomonnaies en portefeuille
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", absoluteGrowth >= 0 ? "text-green-600" : "text-red-600")}>
              {absoluteGrowth >= 0 ? <>Vous avez gagné {formatCurrency(Math.abs(absoluteGrowth))}</> : <>Vous avez perdu {formatCurrency(Math.abs(absoluteGrowth))}</>}
            </div>
            <div className={cn("text-xs mt-1", absoluteGrowth >= 0 ? "text-green-600" : "text-red-600")}>
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
              {timeFrame === '1Y' ? 'Sur les 12 derniers mois' : timeFrame === '1M' ? 'Sur le dernier mois' : timeFrame === '3M' ? 'Sur les 3 derniers mois' : timeFrame === '6M' ? 'Sur les 6 derniers mois' : timeFrame === '5Y' ? 'Sur les 5 dernières années' : 'Historique complet'}
            </CardDescription>
          </div>
          <TimeFrameSelector selectedTimeFrame={timeFrame} onTimeFrameChange={setTimeFrame} />
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChartComponent data={chartData} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Vos Comptes Crypto</h2>
        
        {cryptoAccounts.length > 0 ? (
          <div className="space-y-4">
            {groupedCryptos.map(renderCryptoGroup)}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg text-muted-foreground mb-6">Vous n'avez pas encore de compte crypto</h3>
            <Button 
              className="bg-wealth-primary hover:bg-wealth-primary-dark text-white"
              onClick={handleAddAccount}
            >
              Ajouter votre première crypto
            </Button>
          </div>
        )}
      </div>
    </div>;
};

export default CryptoPage;
