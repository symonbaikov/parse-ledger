'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:inset-0 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-gray-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                   <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
             </div>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transaction-colors"
            >
              <X size={20} />
              <span className="sr-only">Закрыть</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-100 gap-3">
            <button
              onClick={onClose}
              type="button"
              className="py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              type="button"
              className={`
                py-2 px-4 text-sm font-medium text-white rounded-full focus:ring-4 focus:outline-none transition-colors shadow-sm
                ${isDestructive 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
