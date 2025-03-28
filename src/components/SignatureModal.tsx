'use client';

import React from 'react';
import SignaturePad from './SignaturePad';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  type: 'signature' | 'initial';
}

const SignatureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  type
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {type === 'signature' ? 'Draw Your Signature' : 'Draw Your Initials'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SignaturePad
          width={type === 'signature' ? 400 : 200}
          height={type === 'signature' ? 200 : 100}
          onSave={(signature) => {
            onSave(signature);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default SignatureModal; 