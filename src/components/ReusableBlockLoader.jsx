"use client";
import { API_URL } from "@/app/config/url";
import { useEffect } from "react";

export default function ReusableBlockLoader({ editor }) {
useEffect(() => {
  if (!editor) return;

  const loadBlocks = async () => {
    const res = await fetch(`${API_URL}/components`);
    const components = await res.json();

    editor.DomComponents.addType('reusable-tag', {
      model: {
        defaults: {
          tagName: 'div',
          droppable: false,
          editable: false,
          selectable: false,
          highlightable: false,
          copyable: false,
          layerable: false,
          attributes: { class: 'reusable-block' },
          compName: '',
          compType: '',
        },
        init() {
          this.listenTo(this, 'change:compName change:compType', this.updateComponents);
          this.updateComponents();
        },
        async updateComponents() {
          const name = this.get('compName');
          const type = this.get('compType');

          const res = await fetch(`${API_URL}/components`);
          const stored = await res.json();
          const match = stored.find(c => c.name === name && c.type === type);

          if (match) {
            this.components(JSON.parse(match.components || '[]'));

            const iframe = editor.Canvas.getFrameEl();
            const head = iframe?.contentDocument?.head;
            const styleId = `style-reusable-${name}-${type}`;

            if (head && match.css && !head.querySelector(`#${styleId}`)) {
              const style = document.createElement('style');
              style.id = styleId;
              style.innerHTML = match.css;
              head.appendChild(style);
            }
          } else {
            this.components([
              {
                tagName: 'div',
                content: `<div style="color:red">Missing: [[${type}:${name}]]</div>`,
              },
            ]);
          }
        },
        toHTML() {
          return `[[${this.get('compType').toUpperCase()}:${this.get('compName')}]]`;
        },
      },
    });

    components.forEach((comp, index) => {
      editor.BlockManager.add(`reusable-${comp.name}-${index}`, {
        label: `${comp.type.toUpperCase()}: ${comp.name}`,
        category: 'Reusable',
        content: {
          type: 'reusable-tag',
          compName: comp.name,
          compType: comp.type,
        },
        attributes: { class: 'fa fa-cube' },
      });
    });
  };

  loadBlocks();
}, [editor]);


  return null;
}
