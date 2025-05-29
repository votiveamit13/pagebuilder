'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PageViewer({params}) {
  const router = useRouter();
   const { id } = params;

  const [page, setPage] = useState(null);

  useEffect(() => {
  
    if (id) {
      fetch(`https://votivetechnology.in/coachsparkle/api/grapesjs_html/${id}/user_032`)
        .then(res => res.json())
        .then(data => setPage(data.projectData.pages[0]));
    }
  }, [id]);
//   console.log(page.css, id)
  if (!page) return <p>Loading...</p>;

  return (
    <div>
      <style>{page.css}</style>
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}