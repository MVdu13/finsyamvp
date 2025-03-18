
import React from 'react';
import { X, Wallet, BookText, Home } from 'lucide-react';
import { AssetType } from '@/types/assets';

interface FormHeaderProps {
  title: string;
  type: AssetType;
  onCancel: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, type, onCancel }) => {
  const getFormIcon = () => {
    switch (type) {
      case 'bank-account': return <Wallet size={24} className="text-[#FA5003]" />;
      case 'savings-account': return <BookText size={24} className="text-[#FA5003]" />;
      case 'real-estate': return <Home size={24} className="text-[#FA5003]" />;
      default: return null;
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        {getFormIcon()}
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded-full hover:bg-muted transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default FormHeader;
