export interface SignatureField {
  id: string;
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox';
  label: string;
  required: boolean;
  page: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  value?: string;
  signedBy?: string;
  signedAt?: string;
}

export type SignerStatus = 'pending' | 'completed' | 'declined';

export interface Signer {
  id: string;
  name: string;
  email: string;
  order: number;
  status: SignerStatus;
  fields: SignatureField[];
  signedAt?: string;
  declinedAt?: string;
  declineReason?: string;
}

export type RequestStatus = 'draft' | 'sent' | 'pending' | 'completed' | 'expired' | 'declined';

export type AuditAction = 
  | 'created'
  | 'sent'
  | 'viewed'
  | 'field_updated'
  | 'signed'
  | 'declined'
  | 'reminded'
  | 'reminder_sent';

export interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  userId: string;
  details?: string;
}

export interface SignatureRequest {
  id: string;
  status: RequestStatus;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  signers: Signer[];
  auditTrail: AuditEntry[];
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
  };
}

export interface SignatureTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: {
    type: SignatureField['type'];
    label: string;
    required: boolean;
    role: string;
  }[];
  roles: {
    id: string;
    name: string;
    order: number;
  }[];
  metadata: {
    createdAt: string;
    createdBy: string;
    usageCount: number;
  };
}

export interface SignatureSettings {
  expirationDays: number;
  reminderFrequency: {
    initial: number;
    subsequent: number;
  };
  allowedSignatureMethods: ('draw' | 'type' | 'upload')[];
  branding: {
    logo?: string;
    primaryColor?: string;
    accentColor?: string;
  };
} 