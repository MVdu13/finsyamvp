
import React, { useState } from 'react';
import { Plus, Filter, Search, Trash2, Pencil } from 'lucide-react';
import AssetsList from '@/components/assets/AssetsList';
import AssetForm from '@/components/assets/AssetForm';
import { Asset, AssetType } from '@/types/assets';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";

interface AssetsPageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateAsset?: (id: string, asset: Partial<Asset>) => void;
}

const AssetsPage: React.FC<AssetsPageProps> = ({ 
  assets, 
  onAddAsset, 
  onDeleteAsset, 
  onUpdateAsset 
}) => {
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assetTypeTab, setAssetTypeTab] = useState<AssetType>('stock');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const financialAssetsOnly = assets.filter(asset => 
    asset.type !== 'bank-account' && asset.type !== 'savings-account'
  );

  const filteredAssets = financialAssetsOnly.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  const assetsByType: Record<string, Asset[]> = {
    'stock': filteredAssets.filter(asset => asset.type === 'stock'),
    'crypto': filteredAssets.filter(asset => asset.type === 'crypto'),
    'real-estate': filteredAssets.filter(asset => asset.type === 'real-estate'),
    'cash': filteredAssets.filter(asset => asset.type === 'cash'),
    'bonds': filteredAssets.filter(asset => asset.type === 'bonds'),
    'commodities': filteredAssets.filter(asset => asset.type === 'commodities'),
    'other': filteredAssets.filter(asset => asset.type === 'other'),
  };

  const typeLabels: Record<string, string> = {
    'stock': 'Actions',
    'crypto': 'Cryptomonnaies',
    'real-estate': 'Immobilier',
    'cash': 'Liquidités',
    'bonds': 'Obligations',
    'commodities': 'Matières premières',
    'other': 'Autres',
  };

  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => {
    onAddAsset(newAsset);
    setDialogOpen(false);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetTypeTab(asset.type);
    setEditDialogOpen(true);
  };

  const handleUpdateAsset = (updatedAsset: Omit<Asset, 'id'>) => {
    if (editingAsset && onUpdateAsset) {
      onUpdateAsset(editingAsset.id, updatedAsset);
      toast.success("Actif mis à jour avec succès");
      setEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (onDeleteAsset) {
      onDeleteAsset(id);
      toast.success("Actif supprimé avec succès");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Actifs financiers</h1>
          <p className="text-muted-foreground">Gérez tous vos actifs en un seul endroit</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={18} />
              <span>Nouvel actif</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel actif</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="stock" value={assetTypeTab} onValueChange={(value) => setAssetTypeTab(value as AssetType)}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="stock">Actions</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="real-estate">Immobilier</TabsTrigger>
                <TabsTrigger value="other">Autre</TabsTrigger>
              </TabsList>
              <TabsContent value="stock">
                <AssetForm 
                  onSubmit={handleAddAsset}
                  onCancel={() => setDialogOpen(false)}
                  defaultType="stock"
                  showTypeSelector={false}
                />
              </TabsContent>
              <TabsContent value="crypto">
                <AssetForm 
                  onSubmit={handleAddAsset}
                  onCancel={() => setDialogOpen(false)}
                  defaultType="crypto"
                  showTypeSelector={false}
                />
              </TabsContent>
              <TabsContent value="real-estate">
                <AssetForm 
                  onSubmit={handleAddAsset}
                  onCancel={() => setDialogOpen(false)}
                  defaultType="real-estate"
                  showTypeSelector={false}
                />
              </TabsContent>
              <TabsContent value="other">
                <AssetForm 
                  onSubmit={handleAddAsset}
                  onCancel={() => setDialogOpen(false)}
                  defaultType="cash"
                  showTypeSelector={true}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier un actif</DialogTitle>
            </DialogHeader>
            {editingAsset && (
              <AssetForm 
                onSubmit={handleUpdateAsset}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingAsset(null);
                }}
                defaultType={editingAsset.type}
                initialValues={editingAsset}
                isEditing={true}
                showTypeSelector={false}
              />
            )}
          </DialogContent>
        </Dialog>
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
            <option value="bonds">Obligations</option>
            <option value="commodities">Matières premières</option>
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditAsset(asset)}
                            className="p-1.5 rounded-full hover:bg-muted transition-colors text-wealth-primary"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1.5 rounded-full hover:bg-muted transition-colors text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
