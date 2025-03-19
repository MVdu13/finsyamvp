
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Asset, AssetType } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import RealEstateDetailsDialog from './RealEstateDetailsDialog';
import StockDetailsDialog from './StockDetailsDialog';
import CryptoDetailsDialog from './CryptoDetailsDialog';

interface GroupedAssetsListProps {
  groupedAssets: Record<AssetType, Asset[]>;
  navigateTo: (item: string) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
  hideInvestmentAccounts?: boolean;
  onAssetClick?: (asset: Asset) => void;
}

const GroupedAssetsList: React.FC<GroupedAssetsListProps> = ({
  groupedAssets,
  navigateTo,
  onEdit,
  onDelete,
  hideInvestmentAccounts = false,
  onAssetClick
}) => {
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'bank-account': true,
    'savings-account': true,
    'real-estate': true,
    'stock': true,
    'crypto': true
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [cryptoDialogOpen, setCryptoDialogOpen] = useState(false);

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete && onDelete) {
      onDelete(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setAssetToDelete(null);
  };

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAssetClick = (asset: Asset) => {
    if (onAssetClick) {
      onAssetClick(asset);
      return;
    }
    
    let upToDateAsset = asset;
    
    const assetType = asset.type as AssetType;
    if (groupedAssets[assetType]) {
      const foundAsset = groupedAssets[assetType].find(a => a.id === asset.id);
      if (foundAsset) {
        upToDateAsset = foundAsset;
      }
    }
    
    setSelectedAsset(upToDateAsset);
    
    switch (asset.type) {
      case 'real-estate':
        setDetailsDialogOpen(true);
        break;
      case 'stock':
        setStockDialogOpen(true);
        break;
      case 'crypto':
        setCryptoDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const getSectionName = (type: string): string => {
    switch (type) {
      case 'bank-account': return 'Comptes bancaires';
      case 'savings-account': return 'Livrets d\'épargne';
      case 'real-estate': return 'Immobilier';
      case 'stock': return 'Actions';
      case 'crypto': return 'Cryptomonnaies';
      case 'bonds': return 'Obligations';
      case 'cash': return 'Liquidités';
      case 'commodities': return 'Matières premières';
      case 'investment-account': return 'Comptes d\'investissement';
      case 'crypto-account': return 'Comptes crypto';
      default: return 'Autres actifs';
    }
  };

  const getNavigationTarget = (type: string): string => {
    switch (type) {
      case 'bank-account': return 'bank-accounts';
      case 'savings-account': return 'savings-accounts';
      case 'real-estate': return 'real-estate';
      case 'stock': return 'stocks';
      case 'crypto': return 'crypto';
      case 'investment-account': return 'stocks';
      case 'crypto-account': return 'crypto';
      default: return 'assets';
    }
  };

  const filteredGroupedAssets = { ...groupedAssets };
  if (hideInvestmentAccounts) {
    delete filteredGroupedAssets['investment-account'];
    delete filteredGroupedAssets['crypto-account'];
    
    if (filteredGroupedAssets['stock']) {
      filteredGroupedAssets['stock'] = filteredGroupedAssets['stock'].filter(
        asset => !asset.investmentAccountId
      );
    }
    
    if (filteredGroupedAssets['crypto']) {
      filteredGroupedAssets['crypto'] = filteredGroupedAssets['crypto'].filter(
        asset => !asset.cryptoAccountId
      );
    }
  }

  const orderedTypes = Object.keys(filteredGroupedAssets).sort((a, b) => {
    const order = {
      'bank-account': 1,
      'savings-account': 2,
      'real-estate': 3,
      'stock': 4,
      'crypto': 5,
      'bonds': 6,
      'cash': 7,
      'commodities': 8,
      'investment-account': 9,
      'crypto-account': 10,
      'other': 11
    };
    return (order[a as keyof typeof order] || 12) - (order[b as keyof typeof order] || 12);
  });

  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-medium text-lg">Actifs principaux</h3>
      </div>

      <div className="overflow-y-auto flex-grow">
        {orderedTypes.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Aucun actif dans votre patrimoine
          </div>
        ) : (
          <div className="space-y-6">
            {orderedTypes.map(type => {
              const assets = filteredGroupedAssets[type as AssetType];
              if (!assets || assets.length === 0) return null;
              
              const sectionTotal = assets.reduce((sum, asset) => sum + asset.value, 0);
              
              return (
                <div key={type} className="space-y-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-muted rounded-md p-2"
                    onClick={() => toggleSection(type)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections[type] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <h4 className="font-medium">{getSectionName(type)}</h4>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(sectionTotal)}</span>
                  </div>
                  
                  {expandedSections[type] && (
                    <div className="space-y-2 pl-6">
                      {assets.map(asset => (
                        <div 
                          key={asset.id} 
                          className="p-3 rounded-lg border border-border hover:border-wealth-primary/20 transition-all hover:shadow-sm cursor-pointer"
                          onClick={() => handleAssetClick(asset)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-md flex items-center justify-center",
                                asset.type === 'stock' ? "bg-blue-100" : 
                                asset.type === 'crypto' ? "bg-purple-100" : 
                                asset.type === 'real-estate' ? "bg-green-100" : 
                                asset.type === 'cash' ? "bg-gray-100" : 
                                asset.type === 'bank-account' ? "bg-blue-100" :
                                asset.type === 'savings-account' ? "bg-violet-100" :
                                "bg-orange-100"
                              )}>
                                <span className="font-medium text-sm">
                                  {asset.type === 'crypto' && asset.symbol ? 
                                    asset.symbol.substring(0, 2).toUpperCase() : 
                                    asset.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {asset.name}
                                  {asset.type === 'investment-account' && asset.accountType && (
                                    <span className="text-sm text-muted-foreground ml-1">({asset.accountType})</span>
                                  )}
                                  {asset.type === 'crypto-account' && asset.cryptoPlatform && (
                                    <span className="text-sm text-muted-foreground ml-1">({asset.cryptoPlatform})</span>
                                  )}
                                </h4>
                                {asset.type === 'crypto' && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {asset.quantity ? `${asset.quantity} unités à ${asset.purchasePrice ? formatCurrency(asset.purchasePrice) : 'N/A'}` : ''}
                                  </p>
                                )}
                                {asset.type === 'stock' && asset.quantity && asset.purchasePrice && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {asset.quantity} × {formatCurrency(asset.purchasePrice)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(asset.value)}</p>
                              {asset.performance !== undefined && (
                                <p className={cn(
                                  "text-xs flex items-center justify-end gap-1",
                                  asset.performance >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {asset.performance >= 0 ? (
                                    <ArrowUpRight size={14} />
                                  ) : (
                                    <ArrowDownRight size={14} />
                                  )}
                                  {asset.performance > 0 ? "+" : ""}{asset.performance}%
                                </p>
                              )}
                            </div>
                          </div>

                          {(onEdit || onDelete) && (
                            <div className="mt-3 pt-3 border-t border-border flex justify-end gap-2">
                              {onEdit && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(asset);
                                  }} 
                                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-wealth-primary"
                                  title="Modifier"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}
                              {onDelete && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(asset);
                                  }} 
                                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {expandedSections[type] && 
                   type !== 'bank-account' && 
                   type !== 'savings-account' && (
                    <button 
                      className="text-sm text-wealth-primary font-medium pl-6 flex items-center gap-1 hover:underline"
                      onClick={() => navigateTo(getNavigationTarget(type))}
                    >
                      <span>Voir tous les {getSectionName(type).toLowerCase()}</span>
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog 
        isOpen={!!assetToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        assetName={assetToDelete?.name}
      />

      <RealEstateDetailsDialog
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        property={selectedAsset}
      />

      <StockDetailsDialog
        isOpen={stockDialogOpen}
        onClose={() => setStockDialogOpen(false)}
        stock={selectedAsset}
      />

      <CryptoDetailsDialog
        isOpen={cryptoDialogOpen}
        onClose={() => setCryptoDialogOpen(false)}
        crypto={selectedAsset}
      />
    </div>
  );
};

export default GroupedAssetsList;
