
import React from 'react';
import { Asset } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CryptoTransactionsList from './CryptoTransactionsList';
import { cn } from '@/lib/utils';

interface CryptoDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  crypto: Asset | null;
}

const CryptoDetailsDialog: React.FC<CryptoDetailsDialogProps> = ({
  isOpen,
  onClose,
  crypto
}) => {
  if (!crypto) return null;

  const purchaseDate = crypto.purchaseDate 
    ? new Date(crypto.purchaseDate).toLocaleDateString('fr-FR')
    : 'Non spécifié';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{crypto.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Basic information */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center",
                  "bg-purple-100"
                )}>
                  <span className="font-medium text-sm text-purple-600">
                    {crypto.symbol || crypto.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{crypto.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {crypto.symbol || 'Crypto'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(crypto.value)}</p>
                {crypto.performance !== undefined && (
                  <p className={cn(
                    "text-sm flex items-center justify-end gap-1",
                    crypto.performance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {crypto.performance >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {formatPercentage(crypto.performance)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Quantité</p>
                <p className="font-medium">{crypto.quantity || 'N/A'}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Prix d'achat</p>
                <p className="font-medium">{crypto.purchasePrice ? formatCurrency(crypto.purchasePrice) : 'N/A'}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Date d'achat</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  {purchaseDate}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Plateforme</p>
                <p className="font-medium">{crypto.cryptoPlatform || (crypto.cryptoAccountId ? 'Compte crypto' : 'Direct')}</p>
              </div>
            </div>
          </div>
          
          {/* Transactions */}
          {crypto.transactions && crypto.transactions.length > 0 && (
            <CryptoTransactionsList transactions={crypto.transactions} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoDetailsDialog;
