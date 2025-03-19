
import React from 'react';
import { Transaction } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoTransactionsListProps {
  transactions: Transaction[];
  currentPrice?: number;
}

const CryptoTransactionsList: React.FC<CryptoTransactionsListProps> = ({ 
  transactions,
  currentPrice = 0
}) => {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate performance for each transaction if it doesn't exist
  const transactionsWithPerformance = sortedTransactions.map(transaction => {
    if (transaction.performance === undefined && currentPrice > 0 && transaction.type === 'buy') {
      // Calculate performance based on purchase price vs current price
      const performance = ((currentPrice - transaction.price) / transaction.price) * 100;
      return {
        ...transaction,
        performance
      };
    }
    return transaction;
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionsWithPerformance.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className={transaction.type === 'buy' ? "text-green-600" : "text-red-600"}>
                {transaction.type === 'buy' ? 'Achat' : 'Vente'}
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{formatCurrency(transaction.price)}</TableCell>
              <TableCell>{formatCurrency(transaction.total)}</TableCell>
              <TableCell className="text-right">
                {transaction.type === 'buy' && transaction.performance !== undefined ? (
                  <div className={cn("flex items-center justify-end gap-1", 
                    transaction.performance >= 0 ? "text-green-600" : "text-red-600")}>
                    {transaction.performance >= 0 ? 
                      <TrendingUp size={14} /> : 
                      <TrendingDown size={14} />
                    }
                    <span>{formatPercentage(transaction.performance)}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CryptoTransactionsList;
