import React, { useState } from 'react';
import { BarChart3, ArrowUpRight, ArrowDownRight, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import RealEstateDetailsDialog from './RealEstateDetailsDialog';

interface AssetsListProps {
  assets: Asset[];
  title: string;
  showActions?: boolean;
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onAssetClick?: (asset: Asset) => void;
  hideViewAllButton?: boolean;
}

const AssetsList: React.FC<AssetsListProps> = ({ 
  assets, 
  title, 
  showActions = true,
  onEdit,
  onDelete,
  onAssetClick,
  hideViewAllButton = false
}) => {
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  const handleAssetClick = (asset: Asset) => {
    if (onAssetClick) {
      onAssetClick(asset);
    } else if (asset.type === 'real-estate') {
      setSelectedAsset(asset);
      setDetailsDialogOpen(true);
    }
  };

  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-medium text-lg">{title}</h3>
        {showActions && (
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <BarChart3 size={18} />
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-grow">
        <div className="space-y-4">
          {assets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Aucun actif dans cette catégorie
            </div>
          ) : (
            assets.map((asset) => (
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
                      <h4 className="font-medium">{asset.name}</h4>
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
                      {asset.type !== 'crypto' && asset.type !== 'stock' && asset.description && (
                        <p className="text-xs text-muted-foreground">
                          {asset.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(asset.value)}</p>
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
            ))
          )}
        </div>
      </div>

      {showActions && !hideViewAllButton && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium gap-1">
            <span>Voir tous les actifs</span>
            <ExternalLink size={14} />
          </button>
        </div>
      )}

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
    </div>
  );
};

export default AssetsList;
