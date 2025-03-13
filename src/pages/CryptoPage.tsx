
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bitcoin, TrendingUp, TrendingDown, Wallet, Plus, Filter } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';

interface CryptoPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
}

const CryptoPage: React.FC<CryptoPageProps> = ({ assets, onAddAsset }) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Calculate metrics
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const avgPerformance = assets.length > 0 
    ? assets.reduce((sum, asset) => sum + asset.performance, 0) / assets.length
    : 0;
  
  // Générer un historique cohérent basé sur la valeur totale actuelle
  const generateChartData = () => {
    const baseValue = totalValue > 0 ? totalValue : 0;
    
    // Si aucune crypto, retourner des valeurs à zéro
    if (baseValue === 0) {
      return {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [
          {
            label: 'Valeur crypto',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            color: '#F59E0B',
            fill: true,
          }
        ]
      };
    }
    
    // Simulation de la volatilité des cryptomonnaies
    const values = [
      Math.round(baseValue * 0.75),
      Math.round(baseValue * 0.65),
      Math.round(baseValue * 0.85),
      Math.round(baseValue * 0.70),
      Math.round(baseValue * 0.90),
      Math.round(baseValue * 0.80),
      Math.round(baseValue * 0.75),
      Math.round(baseValue * 0.85),
      Math.round(baseValue * 0.92),
      Math.round(baseValue * 0.88),
      Math.round(baseValue * 0.95),
      baseValue
    ];
    
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
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
    // Make sure we're adding a crypto asset
    const cryptoAsset = {
      ...newCrypto,
      type: 'crypto' as AssetType
    };
    
    // Call the parent's onAddAsset function
    onAddAsset(cryptoAsset);
    setDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Crypto ajoutée",
      description: `${newCrypto.name} a été ajouté à votre portefeuille`,
    });
  };

  return (
    <div className="p-6 space-y-6">
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
              <DialogTitle>Ajouter une cryptomonnaie</DialogTitle>
            </DialogHeader>
            <AssetForm 
              onSubmit={handleAddCrypto} 
              onCancel={() => setDialogOpen(false)} 
              defaultType="crypto" 
              showTypeSelector={false}
            />
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
            <div className="text-2xl font-bold">{assets.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Cryptomonnaies en portefeuille
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              avgPerformance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Performance globale du portefeuille
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Évolution de la valeur</CardTitle>
          <CardDescription>
            Suivi de la valeur totale de votre portefeuille crypto sur 12 mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChartComponent data={chartData} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vos Cryptomonnaies</h2>
        {assets.length > 0 ? (
          <AssetsList assets={assets} title="Cryptomonnaies" />
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-lg text-muted-foreground mb-4">
              Aucune cryptomonnaie dans votre portefeuille
            </p>
            <button 
              className="wealth-btn wealth-btn-primary"
              onClick={() => setDialogOpen(true)}
            >
              Ajouter votre première cryptomonnaie
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPage;
