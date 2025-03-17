import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, TrendingUp, TrendingDown, Plus, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

interface StocksPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

interface GroupedStocks {
  [accountId: string]: {
    account: Asset;
    stocks: Asset[];
    totalValue: number;
    avgPerformance: number;
  };
}

interface TransactionRecord {
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  id: string;
}

interface StackedStockInterface {
  name: string;
  transactions: TransactionRecord[];
  totalQuantity: number;
  averagePrice: number;
  totalValue: number;
  performance?: number;
  symbol?: string;
}

const StocksPage: React.FC<StocksPageProps> = ({ 
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
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  const [expandedStocks, setExpandedStocks] = useState<Record<string, boolean>>({});
  
  // Filter investment accounts and stocks
  const investmentAccounts = assets.filter(asset => asset.type === 'investment-account');
  const stocks = assets.filter(asset => asset.type === 'stock');
  
  // Stack similar stocks within each account
  const stackStocksByName = (accountStocks: Asset[]): StackedStockInterface[] => {
    const stocksMap: Record<string, StackedStockInterface> = {};
    
    accountStocks.forEach(stock => {
      const stockName = stock.name;
      const quantity = stock.quantity || 0;
      const purchasePrice = stock.purchasePrice || 0;
      
      if (!stocksMap[stockName]) {
        stocksMap[stockName] = {
          name: stockName,
          transactions: [],
          totalQuantity: 0,
          averagePrice: 0,
          totalValue: 0,
          performance: stock.performance,
          symbol: stock.symbol
        };
      }
      
      stocksMap[stockName].transactions.push({
        quantity,
        purchasePrice,
        purchaseDate: stock.purchaseDate || new Date().toISOString(),
        id: stock.id
      });
      
      stocksMap[stockName].totalQuantity += quantity;
      stocksMap[stockName].totalValue += stock.value;
    });
    
    // Calculate average price for each stacked stock
    Object.values(stocksMap).forEach(stock => {
      stock.averagePrice = stock.totalQuantity > 0 ? stock.totalValue / stock.totalQuantity : 0;
    });
    
    return Object.values(stocksMap);
  };
  
  // Group stocks by investment account
  const groupedStocks: GroupedStocks = investmentAccounts.reduce((acc, account) => {
    const accountStocks = stocks.filter(stock => stock.investmentAccountId === account.id);
    const totalValue = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
    const avgPerformance = accountStocks.length > 0 
      ? accountStocks.reduce((sum, stock) => sum + (stock.performance || 0), 0) / accountStocks.length
      : 0;
    
    acc[account.id] = {
      account,
      stocks: accountStocks,
      totalValue,
      avgPerformance
    };
    
    return acc;
  }, {} as GroupedStocks);
  
  // Handle stocks without an account
  const unassignedStocks = stocks.filter(stock => !stock.investmentAccountId || 
    !investmentAccounts.some(account => account.id === stock.investmentAccountId));
  
  // Calculate total value for all stocks
  const totalValue = stocks.reduce((sum, asset) => sum + asset.value, 0);
  
  // Calculate average performance across all stocks
  const avgPerformance = stocks.length > 0 
    ? stocks.reduce((sum, asset) => sum + (asset.performance || 0), 0) / stocks.length
    : 0;
  
  // Générer un historique cohérent basé sur la valeur totale actuelle et la timeframe
  const generateChartData = () => {
    const baseValue = totalValue > 0 ? totalValue : 0;
    
    // Déterminer le nombre de points de données selon la timeframe
    let numDataPoints;
    let labels;
    
    // Créer des dates basées sur la timeframe s��lectionnée
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
    // Make sure we're adding a stock asset
    const stockAsset = {
      ...newStock,
      type: 'stock' as AssetType
    };
    
    // Check if a similar stock already exists in the same account
    if (stockAsset.investmentAccountId && stockAsset.name) {
      const similarStocks = stocks.filter(s => 
        s.investmentAccountId === stockAsset.investmentAccountId && 
        s.name.toLowerCase() === stockAsset.name.toLowerCase()
      );
      
      // If similar stock exists, show a more specific toast message
      if (similarStocks.length > 0) {
        toast({
          title: "Action ajoutée au groupe existant",
          description: `${newStock.name} a été ajouté à vos transactions existantes`,
        });
      } else {
        toast({
          title: "Action ajoutée",
          description: `${newStock.name} a été ajouté à votre portefeuille`,
        });
      }
    } else {
      toast({
        title: "Action ajoutée",
        description: `${newStock.name} a été ajouté à votre portefeuille`,
      });
    }
    
    // Calculate the stock's value
    if (typeof stockAsset.quantity === 'number' && typeof stockAsset.purchasePrice === 'number') {
      stockAsset.value = stockAsset.quantity * stockAsset.purchasePrice;
    }
    
    // Add purchase date if not provided
    if (!stockAsset.purchaseDate) {
      stockAsset.purchaseDate = new Date().toISOString();
    }
    
    // Call the parent's onAddAsset function
    onAddAsset(stockAsset);
    setDialogOpen(false);
    
    // If this stock was added to an investment account, update the account's value
    if (stockAsset.investmentAccountId && onUpdateAsset) {
      const account = investmentAccounts.find(a => a.id === stockAsset.investmentAccountId);
      if (account) {
        const accountStocks = [...stocks.filter(s => s.investmentAccountId === account.id), stockAsset as Asset];
        const newTotalValue = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
        onUpdateAsset(account.id, { value: newTotalValue });
      }
    }
  };
  
  const handleAddAccount = (newAccount: Omit<Asset, 'id'>) => {
    // Make sure we're adding an investment account
    const accountAsset = {
      ...newAccount,
      type: 'investment-account' as AssetType,
      value: 0
    };
    
    onAddAsset(accountAsset);
    
    toast({
      title: "Compte d'investissement ajouté",
      description: `${newAccount.name} a été ajouté`,
    });
    
    // After adding account, we need to refresh the state to see the new account
    // This is handled by the parent component through assets state update
  };
  
  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setEditDialogOpen(true);
  };

  const handleUpdateAsset = (updatedAsset: Omit<Asset, 'id'>) => {
    if (editingAsset && onUpdateAsset) {
      // Calculate value for stocks
      if (updatedAsset.type === 'stock' && typeof updatedAsset.quantity === 'number' && typeof updatedAsset.purchasePrice === 'number') {
        updatedAsset.value = updatedAsset.quantity * updatedAsset.purchasePrice;
      }
      
      onUpdateAsset(editingAsset.id, updatedAsset);
      
      // If this is a stock, update the parent account's value
      if (updatedAsset.type === 'stock' && updatedAsset.investmentAccountId && onUpdateAsset) {
        const account = investmentAccounts.find(a => a.id === updatedAsset.investmentAccountId);
        if (account) {
          const accountStocks = stocks.map(s => 
            s.id === editingAsset.id ? { ...s, ...updatedAsset } : s
          ).filter(s => s.investmentAccountId === account.id);
          
          const newTotalValue = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
          onUpdateAsset(account.id, { value: newTotalValue });
        }
      }
      
      toast({
        title: "Action modifiée",
        description: `${updatedAsset.name} a été mise à jour`,
      });
      setEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (onDeleteAsset) {
      const assetToDelete = stocks.find(asset => asset.id === id);
      
      if (assetToDelete) {
        // If this is a stock attached to an account, update the account's value
        if (assetToDelete.investmentAccountId && onUpdateAsset) {
          const account = investmentAccounts.find(a => a.id === assetToDelete.investmentAccountId);
          if (account) {
            const remainingStocks = stocks
              .filter(s => s.id !== id)
              .filter(s => s.investmentAccountId === account.id);
            
            const newTotalValue = remainingStocks.reduce((sum, stock) => sum + stock.value, 0);
            onUpdateAsset(account.id, { value: newTotalValue });
          }
        }
        
        onDeleteAsset(id);
        
        toast({
          title: "Action supprimée",
          description: "L'action a été supprimée de votre portefeuille",
        });
      }
    }
  };
  
  const toggleAccountExpand = (accountId: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const toggleStockExpand = (stockName: string) => {
    setExpandedStocks(prev => ({
      ...prev,
      [stockName]: !prev[stockName]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portefeuille d'Actions et ETF</h1>
          <p className="text-muted-foreground">Gérez vos actions et ETF et suivez leur performance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <AssetForm 
              onSubmit={handleAddStock} 
              onCancel={() => setDialogOpen(false)} 
              defaultType="stock" 
              showTypeSelector={false}
              investmentAccounts={investmentAccounts}
              onAddAccount={handleAddAccount}
            />
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier une action/ETF</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <AssetForm 
                onSubmit={handleUpdateAsset}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingAsset(null);
                }}
                defaultType="stock"
                initialValues={editingAsset}
                isEditing={true}
                showTypeSelector={false}
                investmentAccounts={investmentAccounts}
                onAddAccount={handleAddAccount}
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

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Vos Comptes d'Investissement</h2>
        
        {Object.keys(groupedStocks).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedStocks).map(([accountId, { account, stocks, totalValue, avgPerformance }]) => (
              <Card key={accountId} className="overflow-hidden">
                <Collapsible
                  open={expandedAccounts[accountId]}
                  onOpenChange={() => toggleAccountExpand(accountId)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Briefcase className="text-primary" size={20} />
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.accountType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="font-medium text-right">{formatCurrency(totalValue)}</div>
                          <div className={cn(
                            "text-xs flex items-center justify-end",
                            avgPerformance >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {avgPerformance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span className="ml-1">{avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}%</span>
                          </div>
                        </div>
                        {expandedAccounts[accountId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      {stocks.length > 0 ? (
                        <div className="border rounded-md divide-y">
                          {stackStocksByName(stocks).map((stackedStock) => (
                            <Collapsible 
                              key={stackedStock.name} 
                              open={expandedStocks[stackedStock.name]}
                              onOpenChange={() => toggleStockExpand(stackedStock.name)}
                              className="w-full"
                            >
                              <CollapsibleTrigger className="w-full text-left">
                                <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                                  <div>
                                    <div className="font-medium">{stackedStock.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {stackedStock.totalQuantity} × {formatCurrency(stackedStock.averagePrice)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div>{formatCurrency(stackedStock.totalValue)}</div>
                                      <div className={cn(
                                        "text-xs flex items-center justify-end",
                                        (stackedStock.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                                      )}>
                                        {(stackedStock.performance || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        <span className="ml-1">{(stackedStock.performance || 0) > 0 ? "+" : ""}{(stackedStock.performance || 0).toFixed(1)}%</span>
                                      </div>
                                    </div>
                                    {expandedStocks[stackedStock.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-2 bg-muted/30">
                                  <div className="text-sm font-medium pt-2 pb-1 border-b">Transactions</div>
                                  {stackedStock.transactions.map((transaction) => {
                                    const stock = stocks.find(s => s.id === transaction.id);
                                    if (!stock) return null;
                                    
                                    const date = new Date(transaction.purchaseDate);
                                    const formattedDate = date.toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    });
                                    
                                    return (
                                      <ContextMenu key={transaction.id}>
                                        <ContextMenuTrigger>
                                          <div className="py-2 border-b border-border/50 last:border-0 flex items-center justify-between">
                                            <div className="flex items-center">
                                              <Clock size={14} className="mr-2 text-muted-foreground" />
                                              <div>
                                                <div className="text-sm">{formattedDate}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  {transaction.quantity} × {formatCurrency(transaction.purchasePrice)}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                              {formatCurrency(transaction.quantity * transaction.purchasePrice)}
                                            </div>
                                          </div>
                                        </ContextMenuTrigger>
                                        <ContextMenuContent>
                                          <ContextMenuItem onClick={() => handleEditAsset(stock)}>
                                            Modifier
                                          </ContextMenuItem>
                                          <ContextMenuItem onClick={() => handleDeleteAsset(stock.id)} className="text-red-600">
                                            Supprimer
                                          </ContextMenuItem>
                                        </ContextMenuContent>
                                      </ContextMenu>
                                    );
                                  })}
                                  <div className="flex justify-end mt-2">
                                    <button
                                      onClick={() => setDialogOpen(true)}
                                      className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded"
                                    >
                                      + Ajouter une transaction
                                    </button>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-muted/50 rounded">
                          <p className="text-muted-foreground">Aucune action dans ce compte</p>
                          <button
                            onClick={() => setDialogOpen(true)}
                            className="mt-2 wealth-btn wealth-btn-sm"
                          >
                            Ajouter une action
                          </button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Vous n'avez pas encore de compte d'investissement</p>
            <button
              onClick={() => setDialogOpen(true)}
              className="wealth-btn wealth-btn-primary"
            >
              Ajouter votre première action
            </button>
          </Card>
        )}
        
        {unassignedStocks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Actions sans compte assigné</h3>
            <div className="border rounded-md divide-y">
              {stackStocksByName(unassignedStocks).map((stackedStock) => (
                <Collapsible 
                  key={stackedStock.name} 
                  open={expandedStocks[stackedStock.name]}
                  onOpenChange={() => toggleStockExpand(stackedStock.name)}
                  className="w-full"
                >
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div>
                        <div className="font-medium">{stackedStock.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {stackedStock.totalQuantity} × {formatCurrency(stackedStock.averagePrice)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div>{formatCurrency(stackedStock.totalValue)}</div>
                          <div className={cn(
                            "text-xs flex items-center justify-end",
                            (stackedStock.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {(stackedStock.performance || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span className="ml-1">{(stackedStock.performance || 0) > 0 ? "+" : ""}{(stackedStock.performance || 0).toFixed(1)}%</span>
                          </div>
                        </div>
                        {expandedStocks[stackedStock.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-3 pb-2 bg-muted/30">
                      <div className="text-sm font-medium pt-2 pb-1 border-b">Transactions</div>
                      {stackedStock.transactions.map((transaction) => {
                        const stock = unassignedStocks.find(s => s.id === transaction.id);
                        if (!stock) return null;
                        
                        const date = new Date(transaction.purchaseDate);
                        const formattedDate = date.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });
                        
                        return (
                          <ContextMenu key={transaction.id}>
                            <ContextMenuTrigger>
                              <div className="py-2 border-b border-border/50 last:border-0 flex items-center justify-between">
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-2 text-muted-foreground" />
                                  <div>
                                    <div className="text-sm">{formattedDate}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {transaction.quantity} × {formatCurrency(transaction.purchasePrice)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium">
                                  {formatCurrency(transaction.quantity * transaction.purchasePrice)}
                                </div>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem onClick={() => handleEditAsset(stock)}>
                                Modifier
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleDeleteAsset(stock.id)} className="text-red-600">
                                Supprimer
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        );
                      })}
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setDialogOpen(true)}
                          className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded"
                        >
                          + Ajouter une transaction
                        </button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StocksPage;
