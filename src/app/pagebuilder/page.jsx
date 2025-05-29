'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@grapesjs/studio-sdk/style';

import axios from 'axios';
import { API_URL } from '../config/url';

const StudioEditor = dynamic(
    () => import('@grapesjs/studio-sdk/react').then(mod => mod.default),
    { ssr: false }
);

export default function EditorPage() {
    const editorRef = useRef(null);
    const userid = 'user_031';
    //var id = 3;



    const onEditorReady = (editor) => {
        editorRef.current = editor;

        // Get current page name on editor ready
        const pageName = editor.Pages.getSelected()?.get('name');
        if (pageName) {
            alert(`Current page name: ${pageName}`);
        }
    };

    const saveToBackend = async () => {
        const editor = editorRef.current;
        if (!editor) {
            console.error('Editor not ready');
            return;
        }

        const html = editor.getHtml();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const div = doc.querySelector('div');
        const id = 8;

        const css = editor.getCss();
        const assets = JSON.stringify(editor.AssetManager.getAll().map(a => a.toJSON()));
        const components = JSON.stringify(editor.getComponents().map(c => c.toJSON()));
        const styles = JSON.stringify(editor.getStyle());

        // ✅ Get current page name
        const pageName = editor.Pages.getSelected()?.get('name') || 'Untitled';



        try {

            const response = await axios({
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "POST",
                url: `${API_URL}/grapesjs_project`,
                data: {
                    id: '8',
                    userid: 'user_031',
                    name: pageName, // Use the current page name
                    html,
                    css,
                    assets,
                    components,
                    styles,
                },
            });
            // await axios.post(`${API_URL}/grapesjs_project`, {
            //     id: 3,
            //     userid: 'user_031',
            //     name: pageName, // Use the current page name
            //     html,
            //     css,
            //     assets,
            //     components,
            //     styles,
            // });
            console.log(response, 'Project saved successfully');
        } catch (error) {
            console.error('Error saving project:', error.response?.data || error.message);
        }
    };

    const loadFromBackend = async () => {

        try {
            const response = await axios.get(`${API_URL}/grapesjs_project/load/3/${userid}`);
            const projectData = response.data.projectData;

            if (!projectData || !projectData.pages.length) return null;

            const pagesWithParsedComponents = projectData.pages.map(page => {
                let parsedComponent;
                try {
                    parsedComponent = JSON.parse(page.component);
                } catch (e) {
                    console.error('Failed to parse components JSON for page', page.name, e);
                    parsedComponent = '<h1>Failed to load page content</h1>';
                }

                return {
                    ...page,
                    component: parsedComponent,
                };
            });

            return {
                ...projectData,
                pages: pagesWithParsedComponents,
            };
        } catch (error) {
            console.error('Error loading project:', error.response?.data || error.message);
            return null;
        }
    };

    if (!userid) return <div>Loading user...</div>;
    return (
        <div style={{ height: '100vh' }}>
            <StudioEditor
                onEditor={onEditorReady}
                options={{
                    licenseKey: 'ef60735c4f454f7e8c86873dfddaa0fb1c84fddcb39d4e44a254894fcf163784',
                    storage: {
                        type: 'self',
                        autosaveChanges: 5,
                        onSave: async () => {
                            await saveToBackend();
                        },
                        onLoad: async () => {
                            const project = await loadFromBackend();
                            return {
                                project: project || {
                                    pages: [{ name: 'Home', component: '<h1>New Project</h1>' }],
                                },
                            };
                        },
                    },
                    project: {
                        default: {
                            pages: [{ name: 'Home', component: '<h1>Fallback Project</h1>' }],
                        },
                    },
                }}
            />
        </div>
    );
}
