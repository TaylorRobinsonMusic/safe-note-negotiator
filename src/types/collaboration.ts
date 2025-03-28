export interface User {
  id: string;
  name: string;
  email: string;
  role: 'founder' | 'investor' | 'lawyer';
  avatar?: string;
}

export interface Comment {
  id: string;
  userId: string;
  termId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  reactions: {
    [key: string]: string[]; // userId[]
  };
}

export interface TermChange {
  id: string;
  termId: string;
  userId: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'withdrawn';
  comments: Comment[];
}

export interface DocumentVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: TermChange[];
  status: 'draft' | 'proposed' | 'accepted' | 'rejected';
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
  };
}

export interface Notification {
  id: string;
  type: 'term_change' | 'comment' | 'version' | 'signature_request';
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  metadata: {
    documentId?: string;
    termId?: string;
    commentId?: string;
    versionId?: string;
  };
}

export interface CollaborationState {
  users: User[];
  activeUsers: string[]; // userId[]
  comments: Comment[];
  versions: DocumentVersion[];
  notifications: Notification[];
  currentVersion: string; // versionId
} 