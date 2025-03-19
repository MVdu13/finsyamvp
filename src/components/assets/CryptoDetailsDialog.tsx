
import React from 'react';
import { Asset } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CryptoTransactionsList from './CryptoTransactionsList';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { useAssetManager } from '@/hooks/useAssetManager';

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
  const { assets } = useAssetManager();
  
  if (!crypto) return null;

  // Calculate current price if quantity is available
  const currentPrice = crypto.quantity && crypto.quantity > 0 
    ? crypto.value / crypto.quantity 
    : crypto.purchasePrice || 0;
    
  // Calculate performance
  const performance = crypto.performance 
    ? crypto.performance 
    : crypto.purchasePrice && currentPrice
      ? ((currentPrice - crypto.purchasePrice) / crypto.purchasePrice) * 100
      : 0;

  // Get the account name
  const getAccountName = () => {
    if (!crypto.cryptoAccountId) return 'Portefeuille personnel';
    
    // Find the account in assets array
    const account = assets?.find(asset => 
      asset.id === crypto.cryptoAccountId && 
      (asset.type === 'crypto-account' || asset.type === 'investment-account')
    );
    
    return account ? account.name : `Compte ${crypto.cryptoAccountId}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Détails de la cryptomonnaie</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Crypto Name */}
          <h2 className="text-2xl font-bold">{crypto.name}</h2>
          
          {/* Basic information in table format */}
          <div className="bg-white rounded-lg border">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Quantité totale</TableCell>
                  <TableCell className="text-right">{crypto.quantity || '0'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Prix moyen d'achat</TableCell>
                  <TableCell className="text-right">{formatCurrency(crypto.purchasePrice || 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Valeur totale</TableCell>
                  <TableCell className="text-right">{formatCurrency(crypto.value)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn(
                    "text-right",
                    performance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatPercentage(performance)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Compte</TableCell>
                  <TableCell className="text-right">
                    {getAccountName()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Transactions */}
          <div>
            <h3 className="text-xl font-bold mb-4">Transactions</h3>
            {crypto.transactions && crypto.transactions.length > 0 ? (
              <CryptoTransactionsList 
                transactions={crypto.transactions} 
                currentPrice={currentPrice}
              />
            ) : (
              <div className="text-center py-4 bg-muted/30 rounded border">
                <p className="text-muted-foreground">Aucune transaction enregistrée</p>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fermer
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Ajouter une transaction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoDetailsDialog;
