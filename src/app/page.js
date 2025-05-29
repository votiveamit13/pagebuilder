'use client';

import { useState } from 'react'
import dynamic from 'next/dynamic';
import '@grapesjs/studio-sdk/style';
import { useEffect } from 'react';
import { API_URL } from './config/url';
import axios from 'axios';

const StudioEditor = dynamic(
  () => import('@grapesjs/studio-sdk/react').then(mod => mod.default),
  { ssr: false }
);

export default function EditorPage() {
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getBuilderData();
  },[]);

  const getBuilderData = async () => {
           setLoading(true);
        try {
            const response = await axios({
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "GET",
                url: `${API_URL}/grapesjs_project/load/3/user_031`,
            });

            console.log(response.data);
         
        } catch (error) {
            console.error('Error fetching coaches:', error);
        } finally {
            setLoading(false);
        }
  }
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
