'use client';

import dynamic from 'next/dynamic';
import '@grapesjs/studio-sdk/style';

const StudioEditor = dynamic(
  () => import('@grapesjs/studio-sdk/react').then(mod => mod.default),
  { ssr: false }
);

export default function EditorPage() {
  return (
    <div style={{ height: '100vh' }}>
      <StudioEditor
        options={{
          licenseKey: '4f4ac31332114b678bcd6da89a40e8162e6aa7ff23c840d6bf4ec3fd3e04b6dc',
          project: { type: 'web' },
          storage: {
            type: 'local',
          },
        }}
      />
    </div>
  );
}
