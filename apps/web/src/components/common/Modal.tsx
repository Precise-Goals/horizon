import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className={cn(
          "bg-[#FFF8F0] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] w-full max-w-md relative flex flex-col",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b-4 border-[#1A1A1A] bg-white">
          <h2 className="text-xl font-bold uppercase">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 border-2 border-transparent hover:border-[#1A1A1A] hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
