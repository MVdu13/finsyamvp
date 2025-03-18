
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Asset } from '@/types/assets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Info, Percent, Plus, PlusCircle, Trash2, Wallet } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TargetAllocation {
  id: string;
  name: string;
  targetPercentage: number;
  currentValue: number;
  currentPercentage: number;
  difference: number;
  action: 'buy' | 'sell' | 'none';
  amountToAdjust: number;
}

const PortfolioRebalancingPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [targetAllocations, setTargetAllocations] = useState<TargetAllocation[]>([]);
  const [newAllocationName, setNewAllocationName] = useState('');
  const [newAllocationPercentage, setNewAllocationPercentage] = useState('');
  const [totalTargetPercentage, setTotalTargetPercentage] = useState(0);
  const [rebalancingAmount, setRebalancingAmount] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load assets from localStorage
    const storedAssets = localStorage.getItem('financial-assets');
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }

    // Load target allocations from localStorage
    const storedAllocations = localStorage.getItem('target-allocations');
    if (storedAllocations) {
      setTargetAllocations(JSON.parse(storedAllocations));
    }
  }, []);

  useEffect(() => {
    // Calculate total target percentage
    const total = targetAllocations.reduce((sum, allocation) => sum + allocation.targetPercentage, 0);
    setTotalTargetPercentage(total);
  }, [targetAllocations]);

  useEffect(() => {
    // Save target allocations to localStorage
    localStorage.setItem('target-allocations', JSON.stringify(targetAllocations));
  }, [targetAllocations]);

  const addTargetAllocation = () => {
    const percentage = parseFloat(newAllocationPercentage);
    
    if (!newAllocationName) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour l'allocation cible.",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        title: "Erreur",
        description: "Le pourcentage doit être un nombre entre 0 et 100.",
        variant: "destructive",
      });
      return;
    }

    if (totalTargetPercentage + percentage > 100) {
      toast({
        title: "Erreur",
        description: "La somme des pourcentages cibles ne peut pas dépasser 100%.",
        variant: "destructive",
      });
      return;
    }

    const newAllocation: TargetAllocation = {
      id: Date.now().toString(),
      name: newAllocationName,
      targetPercentage: percentage,
      currentValue: 0,
      currentPercentage: 0,
      difference: 0,
      action: 'none',
      amountToAdjust: 0,
    };

    setTargetAllocations([...targetAllocations, newAllocation]);
    setNewAllocationName('');
    setNewAllocationPercentage('');
  };

  const removeTargetAllocation = (id: string) => {
    setTargetAllocations(targetAllocations.filter(allocation => allocation.id !== id));
  };

  const updateAllocationValues = () => {
    if (assets.length === 0) {
      toast({
        title: "Aucun actif trouvé",
        description: "Vous devez d'abord ajouter des actifs dans votre portefeuille.",
      });
      return;
    }

    // Calculate total portfolio value
    const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    // Group assets by name and calculate current values
    const assetsByName = assets.reduce((grouped, asset) => {
      const { name, value } = asset;
      if (!grouped[name]) {
        grouped[name] = 0;
      }
      grouped[name] += value;
      return grouped;
    }, {} as Record<string, number>);

    // Update target allocations with current values and percentages
    const updatedAllocations = targetAllocations.map(allocation => {
      const currentValue = assetsByName[allocation.name] || 0;
      const currentPercentage = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;
      const difference = allocation.targetPercentage - currentPercentage;
      const action = difference > 0.5 ? 'buy' : difference < -0.5 ? 'sell' : 'none';
      const amountToAdjust = Math.abs((difference / 100) * totalPortfolioValue);

      return {
        ...allocation,
        currentValue,
        currentPercentage,
        difference,
        action,
        amountToAdjust,
      };
    });

    setTargetAllocations(updatedAllocations);
  };

  const calculateRebalancing = (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant de rééquilibrage doit être un nombre positif.",
        variant: "destructive",
      });
      return;
    }

    setRebalancingAmount(amount);
    updateAllocationValues();
    setIsDialogOpen(false);
  };

  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Outil de rééquilibrage de portefeuille</h1>
            <p className="text-muted-foreground mt-1">
              Définissez vos allocations cibles et visualisez comment rééquilibrer votre portefeuille
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <ArrowRightLeft size={18} />
                <span>Calculer le rééquilibrage</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calculer le rééquilibrage</DialogTitle>
                <DialogDescription>
                  Entrez le montant que vous souhaitez utiliser pour le rééquilibrage.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="rebalance-amount">Montant de rééquilibrage (€)</Label>
                <Input
                  id="rebalance-amount"
                  type="number"
                  placeholder="5000"
                  onChange={(e) => setRebalancingAmount(parseFloat(e.target.value))}
                />
              </div>
              <DialogFooter>
                <Button onClick={() => rebalancingAmount !== null && calculateRebalancing(rebalancingAmount)}>
                  Calculer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Allocations cibles</CardTitle>
              <CardDescription>
                Définissez la répartition idéale de votre portefeuille
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label htmlFor="asset-name">Nom de l'actif</Label>
                      <Input
                        id="asset-name"
                        placeholder="Actions, Obligations, Immobilier..."
                        value={newAllocationName}
                        onChange={(e) => setNewAllocationName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-percentage">Pourcentage cible (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="target-percentage"
                          type="number"
                          placeholder="25"
                          value={newAllocationPercentage}
                          onChange={(e) => setNewAllocationPercentage(e.target.value)}
                        />
                        <Button onClick={addTargetAllocation} className="shrink-0">
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Total: {totalTargetPercentage}% / 100%
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${totalTargetPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {targetAllocations.length > 0 && (
                  <div className="border rounded-md">
                    <div className="divide-y">
                      {targetAllocations.map((allocation) => (
                        <div key={allocation.id} className="p-3 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{allocation.name}</div>
                            <div className="text-sm text-muted-foreground">{allocation.targetPercentage}%</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTargetAllocation(allocation.id)}
                          >
                            <Trash2 size={18} className="text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {targetAllocations.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">
                      <Percent size={24} className="mx-auto" />
                    </div>
                    <p>Aucune allocation cible définie</p>
                    <p className="text-sm">Ajoutez des allocations pour commencer</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={updateAllocationValues}
                >
                  Mettre à jour les valeurs actuelles
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analyse de rééquilibrage</CardTitle>
              <CardDescription>
                Visualisez les ajustements nécessaires pour atteindre vos allocations cibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {targetAllocations.length > 0 ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Actif</TableHead>
                          <TableHead className="text-right">Cible</TableHead>
                          <TableHead className="text-right">Actuel</TableHead>
                          <TableHead className="text-right">Différence</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {targetAllocations.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell>{allocation.name}</TableCell>
                            <TableCell className="text-right">{allocation.targetPercentage}%</TableCell>
                            <TableCell className="text-right">
                              {allocation.currentPercentage.toFixed(1)}%
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(allocation.currentValue)}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right ${allocation.difference > 0 ? 'text-green-600' : allocation.difference < 0 ? 'text-red-600' : ''}`}>
                              {allocation.difference > 0 ? '+' : ''}{allocation.difference.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right">
                              {allocation.action === 'buy' ? (
                                <div className="text-green-600">
                                  Acheter
                                  <div className="text-xs">
                                    {formatCurrency(allocation.amountToAdjust)}
                                  </div>
                                </div>
                              ) : allocation.action === 'sell' ? (
                                <div className="text-red-600">
                                  Vendre
                                  <div className="text-xs">
                                    {formatCurrency(allocation.amountToAdjust)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Comparaison</h3>
                    <div className="space-y-3">
                      {targetAllocations.map((allocation) => (
                        <div key={allocation.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{allocation.name}</span>
                            <span>
                              Actuel: {allocation.currentPercentage.toFixed(1)}% | Cible: {allocation.targetPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${Math.min(allocation.currentPercentage, allocation.targetPercentage)}%` }}
                            ></div>
                            {allocation.currentPercentage > allocation.targetPercentage && (
                              <div
                                className="h-full bg-red-500"
                                style={{ width: `${allocation.currentPercentage - allocation.targetPercentage}%` }}
                              ></div>
                            )}
                            {allocation.currentPercentage < allocation.targetPercentage && (
                              <div
                                className="h-full bg-green-500 opacity-40"
                                style={{ width: `${allocation.targetPercentage - allocation.currentPercentage}%` }}
                              ></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Valeur totale du portefeuille</div>
                      <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
                      <ArrowRightLeft size={18} />
                      <span>Calculer le rééquilibrage</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mb-3">
                    <Wallet size={32} className="mx-auto" />
                  </div>
                  <p className="text-lg">Définissez vos allocations cibles</p>
                  <p className="max-w-md mx-auto mt-2">
                    Ajoutez des allocations cibles dans le panneau de gauche pour voir comment rééquilibrer votre portefeuille
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Instructions de rééquilibrage</CardTitle>
                <CardDescription>
                  Actions à effectuer pour rééquilibrer votre portefeuille
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Ces instructions vous indiquent les actions à effectuer pour rééquilibrer votre portefeuille selon vos allocations cibles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {targetAllocations.length > 0 ? (
              <div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-red-600">À vendre</h3>
                      {targetAllocations.filter(a => a.action === 'sell').length > 0 ? (
                        <ul className="space-y-2">
                          {targetAllocations
                            .filter(allocation => allocation.action === 'sell')
                            .map(allocation => (
                              <li key={allocation.id} className="flex justify-between bg-red-50 p-3 rounded-md">
                                <div>
                                  <span className="font-medium">{allocation.name}</span>
                                  <div className="text-sm text-muted-foreground">
                                    Réduire de {Math.abs(allocation.difference).toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium text-red-600">{formatCurrency(allocation.amountToAdjust)}</span>
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">Aucune vente nécessaire</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-green-600">À acheter</h3>
                      {targetAllocations.filter(a => a.action === 'buy').length > 0 ? (
                        <ul className="space-y-2">
                          {targetAllocations
                            .filter(allocation => allocation.action === 'buy')
                            .map(allocation => (
                              <li key={allocation.id} className="flex justify-between bg-green-50 p-3 rounded-md">
                                <div>
                                  <span className="font-medium">{allocation.name}</span>
                                  <div className="text-sm text-muted-foreground">
                                    Augmenter de {allocation.difference.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium text-green-600">{formatCurrency(allocation.amountToAdjust)}</span>
                                </div>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">Aucun achat nécessaire</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Une fois ces ajustements effectués, votre portefeuille sera aligné avec vos allocations cibles.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>Définissez vos allocations cibles et calculez le rééquilibrage pour voir les instructions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioRebalancingPage;
