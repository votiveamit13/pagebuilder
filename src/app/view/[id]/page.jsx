'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/url';

export default function PageViewer({ params }) {
  const router = useRouter();
  const { id } = params;

  const [page, setPage] = useState(null);
  const [finalHtml, setFinalHtml] = useState('');
  const [finalCss, setFinalCss] = useState('');


  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/grapesjs_html/${id}/user_032`)
        .then(res => res.json())
        .then(data => setPage(data.projectData.pages[0]));
    }
  }, [id]);


  useEffect(() => {
    if (!page) return;

    const processPage = async () => {
      const res = await fetch(`${API_URL}/components`);
      const components = await res.json();

      let html = page.html;
      let css = page.css;


      let extraCss = '';
      components.forEach(comp => {
        const tag = `[[${comp.type.toUpperCase()}:${comp.name}]]`;
        if (html.includes(tag)) {
          html = html.replaceAll(tag, comp.html);
          extraCss += comp.css || '';
        }
      });

      setFinalHtml(html);
      setFinalCss(css + '\n' + extraCss);
    };

    processPage();
  }, [page]);


  useEffect(() => {
    if (!finalHtml) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('page-container');
      if (!container) return;

      const forms = container.querySelectorAll('form') || [];
      forms.forEach((form, index) => {
        const formId = form.getAttribute('id') || `form-${index}`;
        form.setAttribute('id', formId);

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((el, idx) => {
          if (!el.name) {
            const label = el.closest('div')?.querySelector('label')?.innerText?.trim().toLowerCase();
            if (label) {
              el.setAttribute('name', label.replace(/\s+/g, '_'));
            } else {
              el.setAttribute('name', `field_${idx}`);
            }
          }
        });

        const buttons = form.querySelectorAll('button');
        buttons.forEach(btn => {
          if (!btn.getAttribute('type') || btn.getAttribute('type') === 'button') {
            btn.setAttribute('type', 'submit');
          }
        });

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          const storageKey = `formData-${formId}-page-${id}`;
          localStorage.setItem(storageKey, JSON.stringify(data));
          alert('Form submitted and data saved!');
        });
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [finalHtml, id]);

  if (!page) return <p>Loading...</p>;

  return (
    <div id="page-container">
      <style>{finalCss}</style>
      <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
    </div>
  );
}
