'use client';
//git test change 
import { API_URL } from '@/app/config/url';
import axios from 'axios';
import { useState } from 'react';

export default function ReusableComponent({ editor }) {
  const [showModal, setShowModal] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState('header');

  const updateReusableContent = async () => {
    if (!editor) return;

    const currentPage = editor.Pages.getSelected();
    if (!currentPage) return alert("No page selected.");

    const pageName = currentPage.get("name");
    if (!pageName.startsWith("Reusable: ")) {
      alert("This is not a reusable component page.");
      return;
    }

    const actualName = pageName.replace("Reusable: ", "");

    const res = await axios.get(`${API_URL}/components`);
    const all = res.data;
    const match = all.find((c) => c.name === actualName);

    if (!match) {
      alert("Could not find reusable component in database.");
      return;
    }

    const componentData = {
      name: match.name,
      type: match.type,
      html: editor.getHtml(),
      css: editor.getCss(),
      components: JSON.stringify(editor.getSelected()?.toJSON() || editor.getComponents().toJSON()),
    };

    try {
      // const response = await fetch(`${API_URL}/components/${match.id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(componentData),
      // });
      console.log(componentData)
      const response = await axios({
        method: "PUT",
        url: `${API_URL}/components/${match.id}`,
        data: componentData,
      });

      if (!response.ok) throw new Error("Failed to update component");

      alert(`Reusable component "${match.name}" updated successfully.`);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update reusable component.");
    }
  };



  const saveReusable = async () => {
    if (!editor) return;

    const selected = editor.getSelected();
    if (!selected) return alert('Please select a component to save.');

    const name = componentName;
    const type = componentType;

    const componentData = {
      name,
      type,
      html: selected.toHTML(),
      css: editor.getCss({ component: selected }) || '',
      components: JSON.stringify(selected.toJSON()),
    };


    const res = await fetch(`${API_URL}/components`);
    const all = await res.json();
    const existing = all.find(c => c.name === name && c.type === type);

    if (existing) {
      await fetch(`${API_URL}/components/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(componentData),
      });
      alert('Reusable component updated.');
    } else {
      await fetch(`${API_URL}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(componentData),
      });
      alert('Reusable component saved.');
    }

    setComponentName('');
    setComponentType('header');
    setShowModal(false);
  };


  return (
    <>
      <button
        onClick={updateReusableContent}
        style={{
          position: 'absolute',
          bottom: 70,
          right: 10,
          zIndex: 999,
          padding: '10px',
          borderRadius: '6px',
          background: '#4CAF50',
          color: 'white',
        }}
      >
        Update Reusable Content
      </button>

      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          zIndex: 999,
          padding: '10px',
          borderRadius: '6px',
          background: '#008CBA',
          color: 'white',
        }}
      >
        Save as Reusable
      </button>


      {showModal && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          background: "#ffffff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          width: "360px",
          color: "#333",
          fontFamily: "Arial, sans-serif",
        }}>
          <h3 style={{ marginBottom: "16px" }}>Create Reusable Component</h3>
          <label style={{ display: "block", marginBottom: "12px" }}>
            Name:
            <input
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              style={{ width: "100%", marginTop: "6px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              placeholder="Enter component name"
            />
          </label>
          <label style={{ display: "block", marginBottom: "20px" }}>
            Type:
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="header">Header</option>
              <option value="footer">Footer</option>
              <option value="section">Section</option>
            </select>
          </label>

          <div style={{ textAlign: "right" }}>
            <button onClick={saveReusable} style={{ padding: "10px 16px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", marginRight: "10px" }}>
              Save
            </button>
            <button onClick={() => setShowModal(false)} style={{ padding: "10px 16px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
