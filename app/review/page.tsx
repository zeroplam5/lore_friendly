'use client';

import { ThreePanelLayout } from '@/components/layout/ThreePanelLayout';
import { IssueListPanel } from '@/components/review/IssueListPanel';
import { DocumentSheet } from '@/components/review/DocumentSheet';
import { InspectorPanel } from '@/components/review/InspectorPanel';

export default function ReviewPage() {
  return (
    <ThreePanelLayout
      leftTitle="쟁점 목록"
      rightTitle="인스펙터"
      leftPanel={<IssueListPanel />}
      rightPanel={<InspectorPanel />}
    >
      <DocumentSheet />
    </ThreePanelLayout>
  );
}
