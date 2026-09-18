'use client';

import { useState } from 'react';
import { LibrarySubNav } from '@/components/library/LibrarySubNav';
import { ReferencesView } from '@/components/library/ReferencesView';
import { SettingsView } from '@/components/library/SettingsView';
import { BasicSettingsView } from '@/components/library/BasicSettingsView';

export type LibraryView = 'references' | 'settings' | 'basic';

export default function LibraryPage() {
  const [view, setView] = useState<LibraryView>('references');

  return (
    <div className="flex h-full flex-col">
      <LibrarySubNav view={view} onChangeView={setView} />
      <div className="min-h-0 flex-1">
        {view === 'references' && <ReferencesView />}
        {view === 'settings' && <SettingsView />}
        {view === 'basic' && <BasicSettingsView />}
      </div>
    </div>
  );
}
