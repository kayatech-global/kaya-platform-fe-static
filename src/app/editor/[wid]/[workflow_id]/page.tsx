'use client';
import React from 'react';
import { WorkflowEditorContainer } from './components';
import { DnDProvider } from '@/context';

function page() {
  return (
    <DnDProvider>
      <WorkflowEditorContainer />
    </DnDProvider>
  );
}

export default page;
