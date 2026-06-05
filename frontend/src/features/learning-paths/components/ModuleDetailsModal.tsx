import React from 'react';
import type { Module } from '../../../types/domain';
import { X, BookOpen } from 'lucide-react';

interface ModuleDetailsModalProps {
  module: Module | null;
  onClose: () => void;
}

export const ModuleDetailsModal: React.FC<ModuleDetailsModalProps> = ({ module, onClose }) => {
  if (!module) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#F5F0E8] border-l border-brown-200/60 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="p-6 h-full flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="mt-8 flex-1">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl mb-4">
            {module.order}
          </div>
          <h3 className="text-2xl font-bold text-[#3E2723] mb-4">
            {module.title}
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            {module.description}
          </p>
          
          <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-brown-200/40">
            <BookOpen className="w-5 h-5 text-forest-600" />
            <span className="font-semibold text-slate-700">
              Vsebuje {module.learningUnitsCount} učnih podružnic
            </span>
          </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-brown-200/40">
          <button className="w-full py-3 px-4 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg">
            Začni modul
          </button>
        </div>
      </div>
    </div>
  );
};


