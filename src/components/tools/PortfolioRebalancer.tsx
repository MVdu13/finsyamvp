
import React, { useState } from 'react';
import { Plus, MinusCircle, ArrowUpCircle, ArrowDownCircle, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';

type Asset = {
  id: string;
  name: string;
  currentAmount: number;
  targetPercentage: number;
};

type RebalanceResult = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  difference: number;
  newAmount: number;
};

const PortfolioRebalancer: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Actions', currentAmount: 5000, targetPercentage: 60 },
    { id: '2', name: 'Obligations', currentAmount: 3000, targetPercentage: 30 },
    { id: '3', name: 'Or', currentAmount: 1000, targetPercentage: 10 },
  ]);
  const [results, setResults] = useState<RebalanceResult[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  const addAsset = () => {
    const newId = String(Date.now());
    setAssets([...assets, { id: newId, name: '', currentAmount: 0, targetPercentage: 0 }]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, field: keyof Asset, value: string | number) => {
    setAssets(
      assets.map(asset => {
        if (asset.id === id) {
          return { ...asset, [field]: value };
        }
        return asset;
      })
    );
  };

  const calculateRebalance = () => {
    // Calculate total portfolio value
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentAmount, 0);
    
    // Calculate target amounts and differences
    const rebalanceResults: RebalanceResult[] = assets.map(asset => {
      const targetAmount = (asset.targetPercentage / 100) * totalValue;
      const difference = targetAmount - asset.currentAmount;
      
      return {
        id: asset.id,
        name: asset.name,
        currentAmount: asset.currentAmount,
        targetAmount,
        difference,
        newAmount: asset.currentAmount + difference
      };
    });
    
    setResults(rebalanceResults);
    setHasCalculated(true);
  };

  // Check if sum of target percentages is 100%
  const totalTargetPercentage = assets.reduce((sum, asset) => sum + asset.targetPercentage, 0);
  const isValid = Math.abs(totalTargetPercentage - 100) < 0.01 && assets.every(asset => asset.name.trim() !== '');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom de l'actif</TableHead>
              <TableHead>Montant actuel (€)</TableHead>
              <TableHead>Pourcentage cible (%)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <TableRow key={asset.id}>
                <TableCell>
                  <Input 
                    value={asset.name} 
                    onChange={e => updateAsset(asset.id, 'name', e.target.value)} 
                    placeholder="ex: Actions"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number"
                    min="0"
                    value={asset.currentAmount || ''} 
                    onChange={e => updateAsset(asset.id, 'currentAmount', parseFloat(e.target.value) || 0)} 
                    placeholder="ex: 5000"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={asset.targetPercentage || ''} 
                    onChange={e => updateAsset(asset.id, 'targetPercentage', parseFloat(e.target.value) || 0)} 
                    placeholder="ex: 60"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeAsset(asset.id)}
                    disabled={assets.length <= 1}
                  >
                    <MinusCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addAsset}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Ajouter un actif
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Total: {totalTargetPercentage.toFixed(0)}%
            {Math.abs(totalTargetPercentage - 100) >= 0.01 && (
              <span className="text-red-500 ml-2">
                (doit être égal à 100%)
              </span>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full mt-4" 
          onClick={calculateRebalance}
          disabled={!isValid}
        >
          Rééquilibrer
        </Button>
      </div>
      
      {hasCalculated && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Recommendations de rebalancement</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actif</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Montant final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(result => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell>
                    {Math.abs(result.difference) < 0.01 ? (
                      <div className="flex items-center text-muted-foreground">
                        <CircleDot className="h-4 w-4 mr-2" />
                        Pas de changement
                      </div>
                    ) : result.difference > 0 ? (
                      <div className="flex items-center text-green-600">
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Acheter {formatCurrency(result.difference)}
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <ArrowDownCircle className="h-4 w-4 mr-2" />
                        Vendre {formatCurrency(Math.abs(result.difference))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(result.newAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PortfolioRebalancer;
