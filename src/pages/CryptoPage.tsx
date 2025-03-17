import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bitcoin, TrendingUp, TrendingDown, Wallet, Plus, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import CryptoTransactionsList from '@/components/assets/CryptoTransactionsList';
import { Button } from '@/components/ui/button';

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
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<Asset | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const cryptoAssets = assets.filter(asset => asset.type === 'crypto');
  const cryptoAccounts = assets.filter(asset => asset.type === 'crypto-account');
  
  const totalValue = cryptoAssets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = cryptoAssets.length > 0 
    ? cryptoAssets.reduce((sum, asset) => sum + (asset.performance || 0), 0) / cryptoAssets.length
    : 0;
  
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
    
    const addedAsset = onAddAsset(cryptoAsset);
    setDialogOpen(false);
    
    toast({
      title: "Crypto ajoutée",
      description: `${newCrypto.name} a été ajouté à votre portefeuille`,
    });
    
    return addedAsset;
  };

  const handleAddCryptoAccount = (newAccount: Omit<Asset, 'id'>) => {
    const account = {
      ...newAccount,
      type: 'crypto-account' as AssetType
    };
    
    const addedAccount = onAddAsset(account);
    
    toast({
      title: "Compte crypto ajouté",
      description: `${newAccount.name} a été ajouté`,
    });
    
    return addedAccount;
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
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
    } else {
      setExpandedAccount(accountId);
    }
  };

  const showCryptoDetails = (crypto: Asset) => {
    setSelectedCrypto(crypto);
    setDetailsDialogOpen(true);
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

  const cryptosByAccount = cryptoAssets.reduce((acc, crypto) => {
    const accountId = crypto.cryptoAccountId || 'sans-compte';
    if (!acc[accountId]) {
      acc[accountId] = [];
    }
    acc[accountId].push(crypto);
    return acc;
  }, {} as Record<string, Asset[]>);

  const generateMockTransactions = (crypto: Asset) => {
    if (!crypto.transactions) {
      const transactions = [];
      const currentDate = new Date();
      
      transactions.push({
        id: '1',
        date: new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: crypto.quantity || 0,
        price: crypto.purchasePrice || 0,
        total: (crypto.quantity || 0) * (crypto.purchasePrice || 0),
        type: 'buy' as const,
        performance: 0
      });
      
      if (Math.random() > 0.5) {
        transactions.push({
          id: '2',
          date: new Date(currentDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: (crypto.quantity || 0) * 0.2,
          price: (crypto.purchasePrice || 0) * 1.1,
          total: (crypto.quantity || 0) * 0.2 * (crypto.purchasePrice || 0) * 1.1,
          type: 'buy' as const,
          performance: 10
        });
      }
      
      if (Math.random() > 0.7) {
        transactions.push({
          id: '3',
          date: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          quantity: (crypto.quantity || 0) * 0.1,
          price: (crypto.purchasePrice || 0) * 1.2,
          total: (crypto.quantity || 0) * 0.1 * (crypto.purchasePrice || 0) * 1.2,
          type: 'sell' as const,
          performance: 20
        });
      }
      
      return transactions;
    }
    
    return crypto.transactions;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille Crypto</h1>
          <p className="text-muted-foreground">Gérez vos cryptomonnaies et suivez leur performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="wealth-btn wealth-btn-primary flex items-center gap-2">
                <Plus size={16} />
                <span>Ajouter une crypto</span>
              </Button>
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
                investmentAccounts={cryptoAccounts}
                onAddAccount={handleAddCryptoAccount}
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
                investmentAccounts={cryptoAccounts}
                onAddAccount={handleAddCryptoAccount}
              />
            )}
          </DialogContent>
        </Dialog>
        
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Détails de {selectedCrypto?.name}</DialogTitle>
            </DialogHeader>
            {selectedCrypto && (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantité</p>
                    <p className="text-lg font-medium">{selectedCrypto.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valeur</p>
                    <p className="text-lg font-medium">{formatCurrency(selectedCrypto.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prix d'achat</p>
                    <p className="text-lg font-medium">{formatCurrency(selectedCrypto.purchasePrice || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Performance</p>
                    <p className={cn(
                      "text-lg font-medium flex items-center gap-1",
                      (selectedCrypto.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {(selectedCrypto.performance || 0) >= 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {(selectedCrypto.performance || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                <CryptoTransactionsList 
                  transactions={generateMockTransactions(selectedCrypto)} 
                />
                
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setDetailsDialogOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
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
            {cryptoAccounts.map(account => {
              const accountCryptos = cryptosByAccount[account.id] || [];
              const accountValue = accountCryptos.reduce((sum, crypto) => sum + crypto.value, 0);
              const avgAccountPerformance = accountCryptos.length > 0 
                ? accountCryptos.reduce((sum, crypto) => sum + (crypto.performance || 0), 0) / accountCryptos.length
                : 0;
              
              return (
                <div key={account.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-muted flex items-center justify-between cursor-pointer"
                    onClick={() => toggleAccountExpand(account.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-orange-500" />
                      <h3 className="font-medium">{account.name}</h3>
                      <span className="text-sm text-muted-foreground">({account.cryptoAccountType})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground mr-2">Valeur totale:</span>
                        <span className="font-medium">{formatCurrency(accountValue)}</span>
                      </div>
                      <div className={cn(
                        "text-sm flex items-center",
                        avgAccountPerformance >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {avgAccountPerformance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{avgAccountPerformance > 0 ? "+" : ""}{avgAccountPerformance.toFixed(1)}%</span>
                      </div>
                      {expandedAccount === account.id ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  
                  {expandedAccount === account.id && (
                    <div className="p-4">
                      {accountCryptos.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 py-2 px-4 bg-muted text-sm font-medium">
                            <div>Nom</div>
                            <div>Quantité</div>
                            <div>Prix unitaire</div>
                            <div>Valeur</div>
                            <div>Performance</div>
                          </div>
                          {accountCryptos.map(crypto => (
                            <div 
                              key={crypto.id}
                              className="grid grid-cols-5 py-3 px-4 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                              onClick={() => showCryptoDetails(crypto)}
                            >
                              <div className="font-medium">{crypto.name}</div>
                              <div>{crypto.quantity}</div>
                              <div>{formatCurrency(crypto.value / (crypto.quantity || 1))}</div>
                              <div>{formatCurrency(crypto.value)}</div>
                              <div className={cn(
                                "flex items-center gap-1",
                                (crypto.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {(crypto.performance || 0) >= 0 ? (
                                  <TrendingUp size={16} />
                                ) : (
                                  <TrendingDown size={16} />
                                )}
                                {(crypto.performance || 0).toFixed(2)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Aucune cryptomonnaie dans ce compte</p>
                          <Button
                            className="wealth-btn wealth-btn-primary"
                            onClick={() => setDialogOpen(true)}
                          >
                            Ajouter une cryptomonnaie
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {Object.keys(cryptosByAccount).includes('sans-compte') && (
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 bg-muted flex items-center justify-between cursor-pointer"
                  onClick={() => toggleAccountExpand('sans-compte')}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium">Sans compte attribué</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedAccount === 'sans-compte' ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                </div>
                
                {expandedAccount === 'sans-compte' && (
                  <div className="p-4">
                    <div className="space-y-2">
                      {cryptosByAccount['sans-compte'].map(crypto => (
                        <div 
                          key={crypto.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                          onClick={() => showCryptoDetails(crypto)}
                        >
                          <div className="font-medium">{crypto.name}</div>
                          <div>{formatCurrency(crypto.value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun compte crypto dans votre portefeuille
            </p>
            <Button 
              className="wealth-btn wealth-btn-primary"
              onClick={() => {
                handleAddCryptoAccount({
                  name: "Mon compte Binance",
                  type: 'crypto-account',
                  value: 0,
                  cryptoAccountType: 'Binance',
                  performance: 0
                });
              }}
            >
              Ajouter votre premier compte crypto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPage;
