import { useEffect } from 'react';
import { DocSearch } from '@docsearch/react';
import '@docsearch/css';

export default function Search() {
  useEffect(() => {
    // Add custom styles for dark mode
    const style = document.createElement('style');
    style.textContent = `
      .dark .DocSearch-Button {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }
      
      .dark .DocSearch-Button:hover {
        background-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
      
      .dark .DocSearch-Search-Icon {
        color: rgba(255, 255, 255, 0.6);
      }
      
      .dark .DocSearch-Button-Placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      
      .dark .DocSearch-Button-Keys {
        border-color: rgba(255, 255, 255, 0.15) !important;
        background: rgba(255, 255, 255, 0.05) !important;
      }
      
      .dark .DocSearch-Button-Key {
        box-shadow: none !important;
        background: rgba(255, 255, 255, 0.08) !important;
        color: rgba(255, 255, 255, 0.4) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
      }
      
      .DocSearch-Button {
        margin: 0;
        height: 38px;
        border-radius: 8px;
      }
      
      @media (max-width: 768px) {
        .DocSearch-Button-Keys {
          display: none;
        }
        .DocSearch-Button {
          width: 38px;
        }
        .DocSearch-Button-Placeholder {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <DocSearch
      appId="1FVT9MRV7U"
      apiKey="c5f452ff5fa46f9e6a206367a27028f3"
      indexName="yuluo"
    />
  );
}
