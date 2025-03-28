'use client';

import React, { useState } from 'react';
import { SignatureRequest, SignatureField, SignatureTemplate, SignerStatus } from '../types/signature';
import SignatureModal from './SignatureModal';
import DocumentViewer from './DocumentViewer';
import useSignatureRequest from '../hooks/useSignatureRequest';

interface Props {
  initialRequest: SignatureRequest;
  templates: SignatureTemplate[];
  currentUserId: string;
  onRequestUpdate?: (request: SignatureRequest) => void;
  documentUrl: string;
}

const SignatureFlow: React.FC<Props> = ({
  initialRequest,
  templates,
  currentUserId,
  onRequestUpdate,
  documentUrl
}) => {
  const {
    request,
    updateField,
    sign,
    decline,
    sendReminder,
    isComplete,
    isExpired,
    canSign
  } = useSignatureRequest({
    initialRequest,
    currentUserId,
    onRequestUpdate
  });

  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showInitialsModal, setShowInitialsModal] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const currentSigner = request.signers.find(s => s.id === currentUserId);

  const handleFieldClick = (field: SignatureField) => {
    setActiveFieldId(field.id);
    if (field.type === 'signature') {
      setShowSignatureModal(true);
    } else if (field.type === 'initial') {
      setShowInitialsModal(true);
    }
  };

  const renderField = (field: SignatureField) => {
    switch (field.type) {
      case 'signature':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative border border-gray-300 rounded-md p-4 h-32">
              {field.value ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={field.value}
                    alt="Signature"
                    className="max-h-full"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setActiveFieldId(field.id);
                      setShowSignatureModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Click to sign
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'initial':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative border border-gray-300 rounded-md p-2 h-16">
              {field.value ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={field.value}
                    alt="Initials"
                    className="max-h-full"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setActiveFieldId(field.id);
                      setShowInitialsModal(true);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Add initials
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={field.value || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={field.value || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={field.value === 'true'}
                onChange={(e) => updateField(field.id, e.target.checked.toString())}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
            </div>
          </div>
        );
    }
  };

  const renderSignerStatus = (signer: SignatureRequest['signers'][0]) => {
    switch (signer.status) {
      case 'signed' as SignerStatus:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Signed
          </span>
        );
      case 'declined' as SignerStatus:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Declined
          </span>
        );
      case 'pending' as SignerStatus:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column: Document Viewer */}
      <div>
        <DocumentViewer
          documentUrl={documentUrl}
          fields={currentSigner?.fields || []}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onFieldClick={handleFieldClick}
          readOnly={!canSign}
        />
      </div>

      {/* Right Column: Signature Flow */}
      <div className="space-y-8">
        {/* Document Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Document Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{request.metadata.title}</h3>
                <p className="text-sm text-gray-500">
                  Expires on {new Date(request.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : request.status === 'expired'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Signers</h4>
              <div className="space-y-3">
                {request.signers.map(signer => (
                  <div key={signer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {signer.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{signer.name}</p>
                        <p className="text-xs text-gray-500">{signer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {renderSignerStatus(signer)}
                      {signer.status === 'pending' && (
                        <button
                          onClick={() => sendReminder(signer.id)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Send reminder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signature Fields */}
        {currentSigner && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Signature Fields</h2>
            <div className="space-y-6">
              {currentSigner.fields
                .filter(field => field.page === currentPage)
                .map(field => (
                  <div key={field.id}>
                    {renderField(field)}
                  </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowDeclineModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Decline
              </button>
              <button
                onClick={() => sign(currentSigner.id)}
                disabled={!canSign}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  canSign
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Sign Document
              </button>
            </div>
          </div>
        )}

        {/* Audit Trail */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Trail</h2>
          <div className="space-y-4">
            {request.auditTrail.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {event.action === 'created' && (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                    {event.action === 'signed' && (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {event.action === 'declined' && (
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                  </p>
                  {event.details && (
                    <p className="text-sm text-gray-500">{event.details}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Decline to Sign
            </h3>
            <div>
              <p className="text-sm text-gray-500">
                Please provide a reason for declining to sign this document.
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your reason..."
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentSigner) {
                      decline(currentSigner.id, declineReason);
                      setShowDeclineModal(false);
                    }
                  }}
                  disabled={!declineReason.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setActiveFieldId(null);
        }}
        onSave={(signature) => {
          if (activeFieldId) {
            updateField(activeFieldId, signature);
          }
        }}
        type="signature"
      />

      {/* Initials Modal */}
      <SignatureModal
        isOpen={showInitialsModal}
        onClose={() => {
          setShowInitialsModal(false);
          setActiveFieldId(null);
        }}
        onSave={(signature) => {
          if (activeFieldId) {
            updateField(activeFieldId, signature);
          }
        }}
        type="initial"
      />
    </div>
  );
};

export default SignatureFlow; 