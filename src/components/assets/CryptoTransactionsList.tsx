
import React from 'react';
import { Transaction } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CryptoTransactionsListProps {
  transactions: Transaction[];
  currentPrice?: number;
}

const CryptoTransactionsList: React.FC<CryptoTransactionsListProps> = ({ 
  transactions,
  currentPrice
}) => {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
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
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className={transaction.type === 'buy' ? "text-green-600" : "text-red-600"}>
                {transaction.type === 'buy' ? 'Achat' : 'Vente'}
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{formatCurrency(transaction.price)}</TableCell>
              <TableCell className="text-right">{formatCurrency(transaction.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CryptoTransactionsList;
