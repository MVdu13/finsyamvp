
import React from 'react';
import { Wallet, BookText, Home, TrendingUp, Coins, DollarSign } from 'lucide-react';
import { AssetType } from '@/types/assets';

interface FormHeaderProps {
  title: string;
  type: AssetType;
  showTitle?: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, type, showTitle = true }) => {
  const getFormIcon = () => {
    switch (type) {
      case 'bank-account': return <Wallet size={24} className="text-[#FA5003]" />;
      case 'savings-account': return <BookText size={24} className="text-[#FA5003]" />;
      case 'real-estate': return <Home size={24} className="text-[#FA5003]" />;
      case 'stock': return <TrendingUp size={24} className="text-[#FA5003]" />;
      case 'crypto': return <Coins size={24} className="text-[#FA5003]" />;
      case 'cash': return <DollarSign size={24} className="text-[#FA5003]" />;
      default: return <TrendingUp size={24} className="text-[#FA5003]" />;
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      {getFormIcon()}
      {showTitle && <h2 className="text-lg font-medium">{title}</h2>}
    </div>
  );
};

export default FormHeader;
