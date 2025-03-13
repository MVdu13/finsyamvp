
import React from 'react';
import { BarChart3, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';

interface AssetsListProps {
  assets: Asset[];
  title: string;
  showActions?: boolean;
}

const AssetsList: React.FC<AssetsListProps> = ({ assets, title, showActions = true }) => {
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
                className="p-3 rounded-lg border border-border hover:border-wealth-primary/20 transition-all hover:shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center",
                      asset.type === 'stock' ? "bg-blue-100" : 
                      asset.type === 'crypto' ? "bg-purple-100" : 
                      asset.type === 'real-estate' ? "bg-green-100" : 
                      asset.type === 'cash' ? "bg-gray-100" : 
                      "bg-orange-100"
                    )}>
                      <span className="font-medium text-sm">
                        {asset.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{asset.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {asset.description}
                      </p>
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
              </div>
            ))
          )}
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium gap-1">
            <span>Voir tous les actifs</span>
            <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AssetsList;
