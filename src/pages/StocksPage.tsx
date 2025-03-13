
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, TrendingUp, TrendingDown, Plus, Filter } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset } from '@/types/assets';
import { useToast } from '@/hooks/use-toast';

interface StocksPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
}

const StocksPage: React.FC<StocksPageProps> = ({ assets, onAddAsset }) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  
  // Stock assets are passed from parent
  const stockAssets = assets;
  
  // Calculate total value
  const totalValue = stockAssets.reduce((sum, asset) => sum + asset.value, 0);
  
  // Calculate average performance
  const avgPerformance = stockAssets.length 
    ? stockAssets.reduce((sum, asset) => sum + asset.performance, 0) / stockAssets.length
    : 0;
  
  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => {
    // Make sure we're adding a stock asset
    const stockAsset = {
      ...newAsset,
      type: 'stock'
    };
    
    // Call the parent's onAddAsset function
    onAddAsset(stockAsset);
    
    toast({
      title: "Actif ajouté",
      description: `${newAsset.name} a été ajouté à votre portefeuille.`,
    });
    
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Actions</h1>
          <p className="text-muted-foreground">Gérez vos investissements en actions</p>
        </div>
        
        <div>
          <button 
            className="wealth-btn wealth-btn-primary" 
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} className="mr-1" /> Nouvelle action
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="wealth-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted-foreground">Valeur totale</h3>
            <Briefcase className="text-wealth-primary h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold mt-2">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalValue)}
          </p>
        </div>
        
        <div className="wealth-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted-foreground">Performance</h3>
            {avgPerformance >= 0 ? (
              <TrendingUp className="text-green-500 h-5 w-5" />
            ) : (
              <TrendingDown className="text-red-500 h-5 w-5" />
            )}
          </div>
          <p className={cn(
            "text-2xl font-semibold mt-2",
            avgPerformance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(2)}%
          </p>
        </div>
        
        <div className="wealth-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted-foreground">Actions</h3>
            <Briefcase className="text-wealth-primary h-5 w-5" />
          </div>
          <p className="text-2xl font-semibold mt-2">{stockAssets.length}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Vos actions</h2>
        <button className="wealth-btn wealth-btn-outline flex items-center">
          <Filter size={16} className="mr-2" /> Filtrer
        </button>
      </div>
      
      <div className="wealth-card">
        <AssetsList 
          assets={stockAssets}
          title="Actions"
          showActions={false}
        />
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <AssetForm 
            onSubmit={handleAddAsset}
            onCancel={() => setShowForm(false)}
            defaultType="stock"
          />
        </div>
      )}
    </div>
  );
};

export default StocksPage;
