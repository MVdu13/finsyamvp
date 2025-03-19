
import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Calendar, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import StockTransactionsList from './StockTransactionsList';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import StockDeleteConfirmationDialog from './StockDeleteConfirmationDialog';

interface StockDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Asset | null;
  onDeleteStock?: (id: string) => void;
}

const StockDetailsDialog: React.FC<StockDetailsDialogProps> = ({
  isOpen,
  onClose,
  stock,
  onDeleteStock
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!stock) return null;

  const purchaseDate = stock.purchaseDate 
    ? new Date(stock.purchaseDate).toLocaleDateString('fr-FR')
    : 'Non spécifié';

  // Find the investment account type if it exists
  let accountInfo = "Direct";
  if (stock.investmentAccountId) {
    // Since we don't have direct access to the investment account object,
    // we'll just show the basic info we have
    accountInfo = stock.accountType ? `Compte titre (${stock.accountType})` : "Compte titre";
  }
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (stock && onDeleteStock) {
      onDeleteStock(stock.id);
      setDeleteDialogOpen(false);
      onClose();
    }
  };

  return (
    <>
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
              
              <div className="mt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Quantité totale</TableCell>
                      <TableCell className="text-right">{stock.quantity || '0'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Prix moyen d'achat</TableCell>
                      <TableCell className="text-right">{formatCurrency(stock.purchasePrice || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Valeur totale</TableCell>
                      <TableCell className="text-right">{formatCurrency(stock.value)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Performance</TableCell>
                      <TableCell className={cn(
                        "text-right",
                        (stock.performance || 0) >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {(stock.performance || 0) > 0 ? "+" : ""}{(stock.performance || 0).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Date d'achat</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                        <Calendar size={14} />
                        {purchaseDate}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Compte</TableCell>
                      <TableCell className="text-right">{accountInfo}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Transactions */}
            {stock.transactions && stock.transactions.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-2">Transactions</h4>
                <StockTransactionsList transactions={stock.transactions} />
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/30 rounded">
                <p className="text-muted-foreground">Aucune transaction enregistrée</p>
              </div>
            )}
          </div>
          
          {onDeleteStock && (
            <DialogFooter className="mt-6">
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Supprimer cette action
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      <StockDeleteConfirmationDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        stockName={stock.name}
      />
    </>
  );
};

export default StockDetailsDialog;
