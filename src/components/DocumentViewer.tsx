'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SignatureField } from '../types/signature';

interface Props {
  documentUrl: string;
  fields: SignatureField[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onFieldClick?: (field: SignatureField) => void;
  readOnly?: boolean;
}

const DocumentViewer: React.FC<Props> = ({
  documentUrl,
  fields,
  currentPage,
  onPageChange,
  onFieldClick,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // In a real implementation, we would use a PDF library like PDF.js
    // to render the document and get the total pages
    setLoading(false);
    setTotalPages(1);
  }, [documentUrl]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFieldClick = (field: SignatureField) => {
    if (!readOnly && onFieldClick) {
      onFieldClick(field);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading document</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white shadow-sm rounded-lg p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 2}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Document Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-100 rounded-lg overflow-auto"
        style={{ height: '600px' }}
      >
        <div
          className="relative mx-auto bg-white shadow-lg"
          style={{
            width: `${scale * 100}%`,
            maxWidth: '816px', // Letter size width
            aspectRatio: '8.5 / 11', // Letter size aspect ratio
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Document Content */}
          <img
            src={documentUrl}
            alt="Document"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Signature Fields */}
          {fields
            .filter(field => field.page === currentPage)
            .map(field => (
              <div
                key={field.id}
                className={`absolute cursor-pointer ${
                  readOnly ? '' : 'hover:bg-blue-50 hover:border-blue-300'
                }`}
                style={{
                  left: `${field.position.x}%`,
                  top: `${field.position.y}%`,
                  width: `${field.position.width}%`,
                  height: `${field.position.height}%`,
                  border: '2px dashed #cbd5e0'
                }}
                onClick={() => handleFieldClick(field)}
              >
                {field.value ? (
                  <img
                    src={field.value}
                    alt={field.label}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-sm text-gray-400">
                      {field.label}
                      {field.required && '*'}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 