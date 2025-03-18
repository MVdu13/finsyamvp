
import React from 'react';
import { Transaction } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface CryptoTransactionsListProps {
  transactions: Transaction[];
}

const CryptoTransactionsList: React.FC<CryptoTransactionsListProps> = ({ transactions }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historique des transactions</h3>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {transaction.type === 'buy' ? 'Achat' : 'Vente'}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {transaction.quantity} × {formatCurrency(transaction.price)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(transaction.total)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTransactionsList;
