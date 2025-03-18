
import React from 'react';
import { Asset, Transaction } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import StockTransactionsList from './StockTransactionsList';
import { cn } from '@/lib/utils';

interface StockDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Asset | null;
}

const StockDetailsDialog: React.FC<StockDetailsDialogProps> = ({
  isOpen,
  onClose,
  stock
}) => {
  if (!stock) return null;

  const purchaseDate = stock.purchaseDate 
    ? new Date(stock.purchaseDate).toLocaleDateString('fr-FR')
    : 'Non spécifié';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{stock.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Basic information */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center",
                  "bg-blue-100"
                )}>
                  <span className="font-medium text-sm text-blue-600">
                    {stock.symbol || stock.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{stock.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stock.symbol || 'Action'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(stock.value)}</p>
                {stock.performance !== undefined && (
                  <p className={cn(
                    "text-sm flex items-center justify-end gap-1",
                    stock.performance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {stock.performance >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {formatPercentage(stock.performance)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Quantité</p>
                <p className="font-medium">{stock.quantity || 'N/A'}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Prix d'achat</p>
                <p className="font-medium">{stock.purchasePrice ? formatCurrency(stock.purchasePrice) : 'N/A'}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Date d'achat</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  {purchaseDate}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Compte</p>
                <p className="font-medium">{stock.investmentAccountId ? 'Compte titre' : 'Direct'}</p>
              </div>
            </div>
          </div>
          
          {/* Transactions */}
          {stock.transactions && stock.transactions.length > 0 && (
            <StockTransactionsList transactions={stock.transactions} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailsDialog;
