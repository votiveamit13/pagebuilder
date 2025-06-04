'use client';
import { useEffect, useState } from 'react';

export default function ViewForms() {
  const [formEntries, setFormEntries] = useState([]);

  useEffect(() => {
    const entries = [];

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('formData-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          entries.push({ key, data });
        } catch (e) {
          console.warn('Invalid JSON in localStorage for key:', key);
        }
      }
    });

    setFormEntries(entries);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Submitted Forms</h1>

      {formEntries.length === 0 && (
        <p className="text-gray-500">No forms submitted yet.</p>
      )}

      {formEntries.map(({ key, data }, idx) => (
        <div key={idx} className="mb-8 border border-gray-300 rounded p-4 shadow-sm">
          <h2 className="font-semibold text-blue-600 mb-2">{key}</h2>
          <table className="table-auto w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border px-3 py-1 text-left">Field</th>
                <th className="border px-3 py-1 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([field, value], i) => (
                <tr key={i}>
                  <td className="border px-3 py-1">{field}</td>
                  <td className="border px-3 py-1">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
