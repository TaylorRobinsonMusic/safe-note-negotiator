'use client';

import { useState, useCallback } from 'react';
import { SignatureRequest, SignerStatus, AuditAction, RequestStatus } from '../types/signature';

interface Props {
  initialRequest: SignatureRequest;
  currentUserId: string;
  onRequestUpdate?: (request: SignatureRequest) => void;
}

interface UseSignatureRequestReturn {
  request: SignatureRequest;
  updateField: (fieldId: string, value: string) => void;
  sign: (signerId: string) => void;
  decline: (signerId: string, reason: string) => void;
  sendReminder: (signerId: string) => void;
  isComplete: boolean;
  isExpired: boolean;
  canSign: boolean;
}

const useSignatureRequest = ({
  initialRequest,
  currentUserId,
  onRequestUpdate
}: Props): UseSignatureRequestReturn => {
  const [request, setRequest] = useState<SignatureRequest>(initialRequest);

  const updateRequest = useCallback((updatedRequest: SignatureRequest) => {
    setRequest(updatedRequest);
    onRequestUpdate?.(updatedRequest);
  }, [onRequestUpdate]);

  const updateField = useCallback((fieldId: string, value: string) => {
    const updatedRequest = {
      ...request,
      signers: request.signers.map(signer => ({
        ...signer,
        fields: signer.fields.map(field =>
          field.id === fieldId
            ? { ...field, value, signedBy: currentUserId, signedAt: new Date().toISOString() }
            : field
        )
      }))
    };

    updateRequest(updatedRequest);
  }, [request, currentUserId, updateRequest]);

  const sign = useCallback((signerId: string) => {
    const signer = request.signers.find(s => s.id === signerId);
    if (!signer) return;

    // Check if all required fields are filled
    const hasAllRequiredFields = signer.fields
      .filter(f => f.required)
      .every(f => f.value);

    if (!hasAllRequiredFields) return;

    const updatedRequest = {
      ...request,
      signers: request.signers.map(s =>
        s.id === signerId
          ? { ...s, status: 'completed' as SignerStatus }
          : s
      ),
      auditTrail: [
        ...request.auditTrail,
        {
          action: 'signed' as AuditAction,
          timestamp: new Date().toISOString(),
          userId: signerId,
          details: `Document signed by ${signer.name}`
        }
      ]
    };

    // Check if all signers have completed
    const allSignersCompleted = updatedRequest.signers.every(s => s.status === 'completed');
    if (allSignersCompleted) {
      updatedRequest.status = 'completed' as RequestStatus;
    }

    updateRequest(updatedRequest);
  }, [request, updateRequest]);

  const decline = useCallback((signerId: string, reason: string) => {
    const signer = request.signers.find(s => s.id === signerId);
    if (!signer) return;

    const updatedRequest = {
      ...request,
      status: 'declined' as RequestStatus,
      signers: request.signers.map(s =>
        s.id === signerId
          ? { ...s, status: 'declined' as SignerStatus }
          : s
      ),
      auditTrail: [
        ...request.auditTrail,
        {
          action: 'declined' as AuditAction,
          timestamp: new Date().toISOString(),
          userId: signerId,
          details: `Document declined by ${signer.name}. Reason: ${reason}`
        }
      ]
    };

    updateRequest(updatedRequest);
  }, [request, updateRequest]);

  const sendReminder = useCallback((signerId: string) => {
    const signer = request.signers.find(s => s.id === signerId);
    if (!signer) return;

    // In a real implementation, this would send an email
    console.log(`Sending reminder to ${signer.email}`);

    const updatedRequest = {
      ...request,
      auditTrail: [
        ...request.auditTrail,
        {
          action: 'reminder_sent' as AuditAction,
          timestamp: new Date().toISOString(),
          userId: currentUserId,
          details: `Reminder sent to ${signer.name}`
        }
      ]
    };

    updateRequest(updatedRequest);
  }, [request, currentUserId, updateRequest]);

  const isComplete = request.status === 'completed';
  const isExpired = request.status === 'expired' || new Date(request.expiresAt) < new Date();
  
  const canSign = useCallback(() => {
    if (isComplete || isExpired) return false;

    const currentSigner = request.signers.find(s => s.id === currentUserId);
    if (!currentSigner) return false;

    // Check if it's this signer's turn based on order
    const previousSigners = request.signers.filter(s => s.order < currentSigner.order);
    if (!previousSigners.every(s => s.status === 'completed')) return false;

    return currentSigner.status === 'pending';
  }, [request, currentUserId, isComplete, isExpired])();

  return {
    request,
    updateField,
    sign,
    decline,
    sendReminder,
    isComplete,
    isExpired,
    canSign
  };
};

export default useSignatureRequest; 