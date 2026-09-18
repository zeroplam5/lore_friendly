'use client';

import { useState } from 'react';
import { ThreePanelLayout } from '@/components/layout/ThreePanelLayout';
import { ChapterTree } from '@/components/write/ChapterTree';
import { IdeaBox } from '@/components/write/IdeaBox';
import { DocumentEditor } from '@/components/write/DocumentEditor';
import { SceneMemoPanel } from '@/components/write/SceneMemoPanel';

export default function WritePage() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const editor = (
    <DocumentEditor
      isFocusMode={isFocusMode}
      onEnterFocusMode={() => setIsFocusMode(true)}
      onExitFocusMode={() => setIsFocusMode(false)}
    />
  );

  if (isFocusMode) {
    return <div className="h-full">{editor}</div>;
  }

  return (
    <ThreePanelLayout
      leftTitle="작품 구조"
      rightTitle="설정 & 메모"
      leftPanel={
        <div className="p-4">
          <IdeaBox />
          <ChapterTree />
        </div>
      }
      rightPanel={<SceneMemoPanel />}
    >
      {editor}
    </ThreePanelLayout>
  );
}
