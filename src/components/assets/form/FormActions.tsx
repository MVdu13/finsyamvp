
import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  isEditing: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, isEditing }) => {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="wealth-btn wealth-btn-secondary flex-1"
      >
        Annuler
      </button>
      <button
        type="submit"
        className="wealth-btn wealth-btn-primary flex-1"
      >
        {isEditing ? 'Modifier' : 'Ajouter'}
      </button>
    </div>
  );
};

export default FormActions;
