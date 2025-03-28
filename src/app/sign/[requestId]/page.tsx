'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignatureFlow from '@/components/SignatureFlow';
import { SignatureRequest, SignatureTemplate, RequestStatus, SignerStatus } from '@/types/signature';

export default function SignPage({ params }: { params: { requestId: string } }) {
  const router = useRouter();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  if (!user) {
    return null; // Return null while checking authentication
  }

  // Mock data for the signature request
  const mockRequest: SignatureRequest = {
    id: params.requestId,
    status: 'pending' as RequestStatus,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    createdBy: 'admin',
    metadata: {
      title: 'SAFE Note Agreement',
      description: 'Investment agreement using SAFE (Simple Agreement for Future Equity)',
      tags: ['investment', 'safe', 'agreement']
    },
    signers: [
      {
        id: user.email,
        name: user.name,
        email: user.email,
        order: 1,
        status: 'pending' as SignerStatus,
        fields: [
          {
            id: 'sig1',
            type: 'signature',
            label: 'Signature',
            required: true,
            page: 1,
            position: {
              x: 20,
              y: 70,
              width: 30,
              height: 10
            }
          },
          {
            id: 'init1',
            type: 'initial',
            label: 'Initial',
            required: true,
            page: 1,
            position: {
              x: 20,
              y: 30,
              width: 15,
              height: 5
            }
          },
          {
            id: 'date1',
            type: 'date',
            label: 'Date',
            required: true,
            page: 1,
            position: {
              x: 60,
              y: 70,
              width: 20,
              height: 5
            }
          }
        ]
      }
    ],
    auditTrail: [
      {
        action: 'created',
        timestamp: new Date().toISOString(),
        userId: 'admin',
        details: 'Document created'
      }
    ]
  };

  const mockTemplates: SignatureTemplate[] = [
    {
      id: 'template1',
      name: 'SAFE Note Template',
      description: 'Standard template for SAFE Note agreements',
      category: 'Investment',
      fields: [
        {
          type: 'signature',
          label: 'Investor Signature',
          required: true,
          role: 'investor'
        },
        {
          type: 'signature',
          label: 'Company Signature',
          required: true,
          role: 'company'
        }
      ],
      roles: [
        {
          id: 'investor',
          name: 'Investor',
          order: 1
        },
        {
          id: 'company',
          name: 'Company',
          order: 2
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        usageCount: 42
      }
    }
  ];

  return (
    <SignatureFlow
      initialRequest={mockRequest}
      templates={mockTemplates}
      currentUserId={user.email}
      onRequestUpdate={(request) => console.log('Request updated:', request)}
      documentUrl="/sample-safe-note.png"
    />
  );
} 