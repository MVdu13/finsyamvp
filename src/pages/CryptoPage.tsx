
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bitcoin, TrendingUp, TrendingDown, Wallet, Plus, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType, Transaction } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import TransactionsList from '@/components/assets/StockTransactionsList';

interface CryptoPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

const CryptoPage: React.FC<CryptoPageProps> = ({ 
  assets, 
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset
}) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  
  // Filtrer les comptes crypto et les cryptomonnaies
  const cryptoAccounts = assets.filter(asset => asset.type === 'crypto-account');
  const cryptoAssets = assets.filter(asset => asset.type === 'crypto');
  
  // Pour chaque compte, filtrer les cryptos qui lui sont associées
  const cryptosByAccount = cryptoAccounts.map(account => {
    const accountCryptos = cryptoAssets.filter(crypto => crypto.cryptoAccountId === account.id);
    const accountValue = accountCryptos.reduce((sum, crypto) => sum + crypto.value, 0);
    const avgPerformance = accountCryptos.length > 0 
      ? accountCryptos.reduce((sum, crypto) => sum + (crypto.performance || 0), 0) / accountCryptos.length
      : 0;
    
    return {
      account,
      cryptos: accountCryptos,
      totalValue: accountValue,
      performance: avgPerformance
    };
  });
  
  const totalValue = cryptoAssets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = cryptoAssets.length > 0 
    ? cryptoAssets.reduce((sum, asset) => sum + (asset.performance || 0), 0) / cryptoAssets.length
    : 0;
  
  // Générer les données du graphique comme avant
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
            label: 'Valeur crypto',
            data: Array(labels.length).fill(0),
            color: '#F59E0B',
            fill: true,
          }
        ]
      };
    }
    
    const volatilityFactor = timeFrame === '1M' ? 0.15 : 
                             timeFrame === '3M' ? 0.25 : 
                             timeFrame === '6M' ? 0.4 : 
                             timeFrame === '5Y' ? 0.7 : 
                             timeFrame === 'ALL' ? 0.9 : 0.5;
    
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
      datasets: [
        {
          label: 'Valeur crypto',
          data: values,
          color: '#F59E0B',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();

  const handleAddCrypto = (newCrypto: Omit<Asset, 'id'>) => {
    const cryptoAsset = {
      ...newCrypto,
      type: 'crypto' as AssetType
    };
    
    onAddAsset(cryptoAsset);
    setDialogOpen(false);
    
    toast({
      title: "Crypto ajoutée",
      description: `${newCrypto.name} a été ajouté à votre portefeuille`,
    });
  };
  
  const handleAddCryptoAccount = (newAccount: Omit<Asset, 'id'>) => {
    const accountAsset = {
      ...newAccount,
      type: 'crypto-account' as AssetType
    };
    
    onAddAsset(accountAsset);
    setAccountDialogOpen(false);
    
    toast({
      title: "Compte crypto ajouté",
      description: `${newAccount.name} a été ajouté à votre portefeuille`,
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
        title: "Crypto modifiée",
        description: `${updatedAsset.name} a été mise à jour`,
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
        description: "La cryptomonnaie a été supprimée de votre portefeuille",
      });
    }
  };

  const toggleAccountExpand = (accountId: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const viewAssetDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setTransactionModalOpen(true);
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille Crypto</h1>
          <p className="text-muted-foreground">Gérez vos cryptomonnaies et suivez leur performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogTrigger asChild>
              <button className="wealth-btn flex items-center gap-2">
                <Plus size={16} />
                <span>Ajouter un compte</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un compte crypto</DialogTitle>
              </DialogHeader>
              <AssetForm 
                onSubmit={handleAddCryptoAccount} 
                onCancel={() => setAccountDialogOpen(false)} 
                defaultType="crypto-account" 
                showTypeSelector={false}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
                <Plus size={16} />
                <span>Ajouter une crypto</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter une cryptomonnaie</DialogTitle>
              </DialogHeader>
              <AssetForm 
                onSubmit={handleAddCrypto} 
                onCancel={() => setDialogOpen(false)} 
                defaultType="crypto" 
                showTypeSelector={false}
                cryptoAccounts={cryptoAccounts}
                onAddAccount={(account) => {
                  onAddAsset(account);
                  return cryptoAccounts[cryptoAccounts.length]; // Return the last account after adding
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier une cryptomonnaie</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <AssetForm 
                onSubmit={handleUpdateAsset}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingAsset(null);
                }}
                defaultType="crypto"
                initialValues={editingAsset}
                isEditing={true}
                showTypeSelector={false}
                cryptoAccounts={cryptoAccounts}
                onAddAccount={(account) => {
                  onAddAsset(account);
                  return cryptoAccounts[cryptoAccounts.length]; // Return the last account after adding
                }}
              />
            )}
          </DialogContent>
        </Dialog>
        
        <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedAsset?.name} - Détails</DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valeur actuelle</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedAsset.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <p className={cn(
                      "text-lg font-semibold flex items-center gap-1",
                      selectedAsset.performance >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {selectedAsset.performance >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      {selectedAsset.performance}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité</p>
                    <p className="text-lg font-semibold">{selectedAsset.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix d'achat unitaire</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedAsset.purchasePrice || 0)}</p>
                  </div>
                </div>
                
                {selectedAsset.transactions && selectedAsset.transactions.length > 0 && (
                  <TransactionsList 
                    transactions={selectedAsset.transactions} 
                    title="Historique des transactions"
                  />
                )}
              </div>
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
        <h2 className="text-xl font-semibold mb-4">Vos Comptes Crypto</h2>
        {cryptoAccounts.length > 0 ? (
          <div className="space-y-4">
            {cryptosByAccount.map(({ account, cryptos, totalValue, performance }) => (
              <Card key={account.id} className="overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                  onClick={() => toggleAccountExpand(account.id)}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="text-orange-500" size={20} />
                    <div>
                      <h3 className="font-medium">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.cryptoAccountType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(totalValue)}</p>
                      <p className={cn(
                        "text-xs flex items-center justify-end",
                        performance >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {performance >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        <span>{performance > 0 ? "+" : ""}{performance.toFixed(1)}%</span>
                      </p>
                    </div>
                    {expandedAccounts[account.id] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                </div>
                
                {expandedAccounts[account.id] && (
                  <div className="px-4 pb-4">
                    {cryptos.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left">Nom</th>
                              <th className="px-4 py-2 text-right">Quantité</th>
                              <th className="px-4 py-2 text-right">Prix unitaire</th>
                              <th className="px-4 py-2 text-right">Performance</th>
                              <th className="px-4 py-2 text-right">Valeur</th>
                              <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cryptos.map(crypto => (
                              <tr key={crypto.id} className="border-t hover:bg-muted/30">
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <Bitcoin size={16} className="text-yellow-500" />
                                    <span>{crypto.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right">{crypto.quantity}</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(crypto.value / (crypto.quantity || 1))}</td>
                                <td className="px-4 py-2 text-right">
                                  <span className={crypto.performance >= 0 ? "text-green-600" : "text-red-600"}>
                                    {crypto.performance}%
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right font-medium">{formatCurrency(crypto.value)}</td>
                                <td className="px-4 py-2 text-center">
                                  <div className="flex justify-center space-x-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        viewAssetDetails(crypto);
                                      }}
                                      className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80"
                                    >
                                      Détails
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAsset(crypto);
                                      }}
                                      className="text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary"
                                    >
                                      Modifier
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">Aucune cryptomonnaie dans ce compte</p>
                        <button 
                          className="mt-2 wealth-btn wealth-btn-sm"
                          onClick={() => setDialogOpen(true)}
                        >
                          Ajouter une crypto
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun compte crypto dans votre portefeuille
            </p>
            <button 
              className="wealth-btn wealth-btn-primary mb-2"
              onClick={() => setAccountDialogOpen(true)}
            >
              Ajouter votre premier compte crypto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPage;
