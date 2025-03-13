
import React, { useState } from 'react';
import { Plus, Filter, BarChart3, Search } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';

interface AssetsPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
}

const AssetsPage: React.FC<AssetsPageProps> = ({ assets, onAddAsset }) => {
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => {
    onAddAsset(newAsset);
    setShowAddAssetForm(false);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Group assets by type
  const assetsByType: Record<string, Asset[]> = {
    'stock': filteredAssets.filter(asset => asset.type === 'stock'),
    'crypto': filteredAssets.filter(asset => asset.type === 'crypto'),
    'real-estate': filteredAssets.filter(asset => asset.type === 'real-estate'),
    'cash': filteredAssets.filter(asset => asset.type === 'cash'),
    'other': filteredAssets.filter(asset => asset.type === 'other'),
  };

  const typeLabels: Record<string, string> = {
    'stock': 'Actions',
    'crypto': 'Cryptomonnaies',
    'real-estate': 'Immobilier',
    'cash': 'Liquidités',
    'other': 'Autres',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Actifs financiers</h1>
          <p className="text-muted-foreground">Gérez tous vos actifs en un seul endroit</p>
        </div>
        
        <button 
          className="wealth-btn wealth-btn-primary flex items-center gap-2"
          onClick={() => setShowAddAssetForm(true)}
        >
          <Plus size={18} />
          <span>Nouvel actif</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher un actif..."
            className="wealth-input w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <select
            className="wealth-input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AssetType | 'all')}
          >
            <option value="all">Tous les types</option>
            <option value="stock">Actions</option>
            <option value="crypto">Cryptomonnaies</option>
            <option value="real-estate">Immobilier</option>
            <option value="cash">Liquidités</option>
            <option value="other">Autres</option>
          </select>
          
          <button className="wealth-btn wealth-btn-secondary flex items-center gap-2">
            <Filter size={18} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
      </div>
      
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-lg text-muted-foreground mb-4">Aucun actif ne correspond à votre recherche</p>
          <button 
            className="wealth-btn wealth-btn-primary"
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(assetsByType).map(([type, assets]) => 
            assets.length > 0 && (
              <div key={type} className="space-y-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-wealth-primary"></span>
                  {typeLabels[type]} ({assets.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="wealth-card wealth-card-hover">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">{asset.description}</p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          asset.performance >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {asset.performance > 0 ? '+' : ''}{asset.performance}%
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <span className="text-lg font-semibold">{new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(asset.value)}</span>
                        <button className="text-xs text-wealth-primary font-medium hover:underline">
                          Détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
      
      {showAddAssetForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <AssetForm 
            onSubmit={handleAddAsset}
            onCancel={() => setShowAddAssetForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
