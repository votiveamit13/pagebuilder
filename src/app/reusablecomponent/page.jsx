"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@grapesjs/studio-sdk/style";
import ReusableComponent from "@/components/ReusableComponents";
import ReusableBlockLoader from "@/components/ReusableBlockLoader";
import { API_URL } from "../config/url";
import axios from "axios";

const StudioEditor = dynamic(
  () => import("@grapesjs/studio-sdk/react").then((mod) => mod.default),
  { ssr: false }
);

export default function EditorPage() {
  const editorRef = useRef(null);
  const userid = "user_032";
  const [editorInstance, setEditorInstance] = useState(null);
  const [pageId, setPageId] = useState(null);

  const onEditorReady = (editor) => {
    editorRef.current = editor;
    setEditorInstance(editor);
    editor.Storage.setAutosave(false);
    editor.Storage.setStepsBeforeSave(0);

    editor.Commands.add("core:save-project", {
      run: () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        const pages = editor.Pages.getAll().map((page) => ({
          name: page.get("name"),
          component: page.getMainComponent().toJSON(),
        }));

        localStorage.setItem(
          "grapesjs-project",
          JSON.stringify({ html, css, pages })
        );
        alert("Page saved to localStorage");
      },
    });

    editor.on("select", (selectedPage) => {
      const name = selectedPage.get("name");
      if (name?.startsWith("Reusable: ")) {
        const actualName = name.replace("Reusable: ", "");
        const reusableComponents = JSON.parse(
          localStorage.getItem("loadedReusableComponents") || "[]"
        );
        const match = reusableComponents.find((c) => c.name === actualName);
        if (match) {
          localStorage.setItem(
            "lastSavedReusable",
            JSON.stringify({
              id: match.id,
              name: match.name,
              type: match.type,
            })
          );
        }
      } else {
        localStorage.removeItem("lastSavedReusable");
      }
    });

    const pageName = editor.Pages.getSelected()?.get("name");
    if (pageName) {
      alert(`Current page name: ${pageName}`);
    }
  };

  const saveToBackend = async () => {
    const editor = editorRef.current;
    if (!editor) {
      console.error("Editor not ready");
      return;
    }

    const page = editor.Pages.getSelected();
    if (!page) {
      alert("No page selected to save.");
      return;
    }

    const pageName = page.get("name") || "Home";
    const html = editor.getHtml();
    const css = editor.getCss();
    const assets = JSON.stringify(
      editor.AssetManager.getAll().map((a) => a.toJSON())
    );
   const components = JSON.stringify(page.getMainComponent().toJSON());
    //const components = JSON.stringify(editor.getComponents().toJSON());
    console.log("Saving Components:", components);


    const styles = JSON.stringify(editor.getStyle());

    try {
      const response = await axios({
        method: "POST",
        url: `${API_URL}/grapesjs_project`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          id: pageId,
          userid,
          name: pageName,
          html,
          css,
          assets,
          components,
          styles,
        },
      });

      alert("Page saved successfully");
      console.log("Saved:", response.data);

      if (response.data.id) {
        setPageId(response.data.id);
      }
    } catch (error) {
      console.error(
        "Error saving project:",
        error.response?.data || error.message
      );
      alert("Failed to save page");
    }
  };

  const loadFromBackend = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/grapesjs_project/load/3/${userid}`
      );
      const projectData = response.data.projectData;

      const componentsResponse = await axios.get(`${API_URL}/components`);
      const reusableComponents =
        componentsResponse.data.data || componentsResponse.data || [];

      localStorage.setItem(
        "loadedReusableComponents",
        JSON.stringify(reusableComponents)
      );

      const pagesWithParsedComponents = (projectData?.pages || []).map(
        (page) => {
          let parsedComponent;
          try {
            parsedComponent =
              typeof page.component === "string"
                ? JSON.parse(page.component)
                : page.component;
          } catch (e) {
            console.error(
              "Failed to parse page.component for page:",
              page.name,
              e
            );
            parsedComponent = { type: "text", content: "Failed to load" };
          }

          return {
            ...page,
            component: parsedComponent,
          };
        }
      );

      const reusablePages = reusableComponents.map((comp) => {
        let parsedComp = comp.components;
        try {
          parsedComp =
            typeof comp.components === "string"
              ? JSON.parse(comp.components)
              : comp.components;
        } catch (err) {
          console.warn(
            `Error parsing reusable component "${comp.name}":`,
            err
          );
          parsedComp = {
            type: "text",
            content: "Failed to load reusable component",
          };
        }
        return {
          id: comp.id,
          name: `Reusable: ${comp.name}`,
          component: parsedComp,
        };
      });

      const allPages = [...pagesWithParsedComponents, ...reusablePages];

      if (allPages.length) {
        setPageId(allPages[0].id);

        const firstPage = allPages[0];
        if (firstPage.name.startsWith("Reusable: ")) {
          const actualName = firstPage.name.replace("Reusable: ", "");
          const match = reusableComponents.find(
            (c) => c.name === actualName
          );
          if (match) {
            localStorage.setItem(
              "lastSavedReusable",
              JSON.stringify({
                id: match.id,
                name: match.name,
                type: match.type,
              })
            );
          }
        }
      }

      return { pages: allPages };
    } catch (error) {
      console.error(
        "Error loading project or reusable components:",
        error.response?.data || error.message
      );
      return null;
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <StudioEditor
        onEditor={onEditorReady}
        options={{
          licenseKey:
            "4f4ac31332114b678bcd6da89a40e8162e6aa7ff23c840d6bf4ec3fd3e04b6dc",
          storage: {
            type: "self",
            onSave: async () => {
              await saveToBackend();
            },
            onLoad: async () => {
              const project = await loadFromBackend();
              return {
                project: project || {
                  pages: [{ name: "Home", component: "<h1>New Project</h1>" }],
                },
              };
            },
          },
          storageManager: {
            autosave: false,
            autoload: true,
          },
          project: {
            default: {
              pages: [{ name: "Home", component: "<h1>Fallback Project</h1>" }],
            },
          },
        }}
      />
      {editorInstance && <ReusableComponent editor={editorInstance} />}
      {editorInstance && <ReusableBlockLoader editor={editorInstance} />}
    </div>
  );
}
