'use client';

import React, { useState } from 'react';
import { DocumentVersion, TermChange } from '../types/collaboration';

interface Props {
  versions: DocumentVersion[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  onVersionApprove: (versionId: string) => void;
  onVersionReject: (versionId: string) => void;
}

const VersionHistory: React.FC<Props> = ({
  versions,
  currentVersionId,
  onVersionSelect,
  onVersionApprove,
  onVersionReject
}) => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const formatChangeValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const renderChangeDescription = (change: TermChange): string => {
    const oldValue = formatChangeValue(change.oldValue);
    const newValue = formatChangeValue(change.newValue);
    
    return `Changed from ${oldValue} to ${newValue}`;
  };

  const getStatusBadgeColor = (status: DocumentVersion['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'proposed':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Version History</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Current Version: {versions.find(v => v.id === currentVersionId)?.version || 'N/A'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {versions.map(version => (
          <div
            key={version.id}
            className={`bg-white rounded-lg shadow overflow-hidden ${
              version.id === currentVersionId ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium">v{version.version}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(version.status)}`}>
                    {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {version.status === 'proposed' && (
                    <>
                      <button
                        onClick={() => onVersionApprove(version.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onVersionReject(version.id)}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onVersionSelect(version.id)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    View
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600">{version.metadata.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                  <span>By {version.createdBy}</span>
                  {version.metadata.tags && version.metadata.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {version.metadata.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setExpandedVersion(
                  expandedVersion === version.id ? null : version.id
                )}
                className="flex items-center space-x-1 mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                <span>{expandedVersion === version.id ? 'Hide' : 'Show'} Changes</span>
                <svg
                  className={`w-4 h-4 transform ${
                    expandedVersion === version.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedVersion === version.id && (
                <div className="mt-4 space-y-3">
                  {version.changes.map(change => (
                    <div
                      key={change.id}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {change.termId}
                        </p>
                        <p className="text-gray-600">
                          {renderChangeDescription(change)}
                        </p>
                        {change.comments.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            {change.comments.map(comment => (
                              <div key={comment.id} className="mt-2">
                                <p className="text-xs text-gray-500">
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory; 