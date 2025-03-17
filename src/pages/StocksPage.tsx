import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, TrendingUp, TrendingDown, Plus, Filter, ChevronDown, ChevronUp, InfoIcon } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StocksPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => Asset | null | undefined;
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
  
  const investmentAccounts = assets.filter(asset => asset.type === 'investment-account');
  const stocks = assets.filter(asset => asset.type === 'stock');
  
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
  
  const unassignedStocks = stocks.filter(stock => !stock.investmentAccountId || 
    !investmentAccounts.some(account => account.id === stock.investmentAccountId));
  
  const totalValue = stocks.reduce((sum, asset) => sum + asset.value, 0);
  
  const avgPerformance = stocks.length > 0 
    ? stocks.reduce((sum, asset) => sum + (asset.performance || 0), 0) / stocks.length
    : 0;
  
  useEffect(() => {
    console.info('StocksPage - Investment Accounts:', investmentAccounts);
  }, [investmentAccounts]);
  
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
            label: 'Valeur actions',
            data: Array(labels.length).fill(0),
            color: '#2563EB',
            fill: true,
          }
        ]
      };
    }
    
    const volatilityFactor = timeFrame === '1M' ? 0.05 : 
                             timeFrame === '3M' ? 0.08 : 
                             timeFrame === '6M' ? 0.12 : 
                             timeFrame === '5Y' ? 0.25 : 
                             timeFrame === 'ALL' ? 0.35 : 0.15;
    
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
          label: 'Valeur actions',
          data: values,
          color: '#2563EB',
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

  const handleAddStock = (newStock: Omit<Asset, 'id'>) => {
    const stockAsset = {
      ...newStock,
      type: 'stock' as AssetType,
    };
    
    if (typeof stockAsset.quantity === 'number' && typeof stockAsset.purchasePrice === 'number') {
      stockAsset.value = stockAsset.quantity * stockAsset.purchasePrice;
    }
    
    const result = onAddAsset(stockAsset);
    
    if (result) {
      setDialogOpen(false);
      
      if (stockAsset.investmentAccountId && onUpdateAsset) {
        const account = investmentAccounts.find(a => a.id === stockAsset.investmentAccountId);
        if (account) {
          const accountStocks = [...stocks.filter(s => s.investmentAccountId === account.id), stockAsset as Asset];
          const newTotalValue = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
          onUpdateAsset(account.id, { value: newTotalValue });
        }
      }
      
      toast({
        title: "Action ajoutée",
        description: `${newStock.name} a été ajouté à votre portefeuille`,
      });
    }
  };
  
  const handleAddAccount = (newAccount: Omit<Asset, 'id'>) => {
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
    
    setDialogOpen(false);
  };
  
  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setEditDialogOpen(true);
  };

  const handleUpdateAsset = (updatedAsset: Omit<Asset, 'id'>) => {
    if (editingAsset && onUpdateAsset) {
      const updatedStock = {
        ...updatedAsset,
        quantity: updatedAsset.quantity || editingAsset.quantity || 0,
        purchasePrice: updatedAsset.purchasePrice || editingAsset.purchasePrice || 0
      };
      
      if (updatedStock.type === 'stock' && typeof updatedStock.quantity === 'number' && typeof updatedStock.purchasePrice === 'number') {
        updatedStock.value = updatedStock.quantity * updatedStock.purchasePrice;
      }
      
      onUpdateAsset(editingAsset.id, updatedStock);
      
      if (updatedStock.type === 'stock' && updatedStock.investmentAccountId && onUpdateAsset) {
        const account = investmentAccounts.find(a => a.id === updatedStock.investmentAccountId);
        if (account) {
          const accountStocks = stocks.map(s => 
            s.id === editingAsset.id ? { ...s, ...updatedStock } : s
          ).filter(s => s.investmentAccountId === account.id);
          
          const newTotalValue = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
          onUpdateAsset(account.id, { value: newTotalValue });
        }
      }
      
      toast({
        title: "Action modifiée",
        description: `${updatedStock.name} a été mise à jour`,
      });
      setEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (onDeleteAsset) {
      const assetToDelete = stocks.find(asset => asset.id === id);
      
      if (assetToDelete) {
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

  const [selectedStock, setSelectedStock] = useState<Asset | null>(null);
  const [stockDetailsOpen, setStockDetailsOpen] = useState(false);
  
  const openStockDetails = (stock: Asset) => {
    setSelectedStock(stock);
    setStockDetailsOpen(true);
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
                          {stocks.map((stock) => (
                            <div key={stock.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                              <div>
                                <div className="font-medium">{stock.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {stock.quantity} × {formatCurrency(stock.purchasePrice || 0)}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div>{formatCurrency(stock.value)}</div>
                                  <div className={cn(
                                    "text-xs flex items-center justify-end",
                                    (stock.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                                  )}>
                                    {(stock.performance || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <span className="ml-1">{(stock.performance || 0) > 0 ? "+" : ""}{(stock.performance || 0).toFixed(1)}%</span>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openStockDetails(stock);
                                          }}
                                          className="text-xs p-1.5 bg-muted hover:bg-muted/80 rounded-full"
                                        >
                                          <InfoIcon size={14} />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Voir les détails</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAsset(stock);
                                    }}
                                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAsset(stock.id);
                                    }}
                                    className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            </div>
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
              {unassignedStocks.map((stock) => (
                <div key={stock.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {stock.quantity} × {formatCurrency(stock.purchasePrice || 0)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div>{formatCurrency(stock.value)}</div>
                      <div className={cn(
                        "text-xs flex items-center justify-end",
                        (stock.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {(stock.performance || 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span className="ml-1">{(stock.performance || 0) > 0 ? "+" : ""}{(stock.performance || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAsset(stock)}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(stock.id)}
                        className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={stockDetailsOpen} onOpenChange={setStockDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'action</DialogTitle>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{selectedStock.name}</h3>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantité totale</TableCell>
                      <TableCell className="text-right">{selectedStock.quantity || '0'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Prix d'achat</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedStock.purchasePrice || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Valeur totale</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedStock.value)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Performance</TableCell>
                      <TableCell className={cn(
                        "text-right",
                        (selectedStock.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {(selectedStock.performance || 0) > 0 ? "+" : ""}{(selectedStock.performance || 0).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    {selectedStock.investmentAccountId && (
                      <TableRow>
                        <TableCell className="font-medium">Compte</TableCell>
                        <TableCell className="text-right">
                          {investmentAccounts.find(acc => acc.id === selectedStock.investmentAccountId)?.name || ""}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Transactions</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{selectedStock.purchaseDate || "Non spécifiée"}</TableCell>
                        <TableCell>{selectedStock.quantity || '0'}</TableCell>
                        <TableCell>{formatCurrency(selectedStock.purchasePrice || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedStock.value)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button 
                  className="wealth-btn" 
                  onClick={() => setStockDetailsOpen(false)}
                >
                  Fermer
                </button>
                <button 
                  className="wealth-btn wealth-btn-primary" 
                  onClick={() => {
                    setStockDetailsOpen(false);
                    handleEditAsset(selectedStock);
                  }}
                >
                  Modifier
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StocksPage;
