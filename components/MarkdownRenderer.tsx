import React from 'react';

interface MarkdownRendererProps {
  markdown: string;
}

const parseMarkdown = (text: string) => {
    if (!text) return '';

    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-2 border-b border-gray-600 pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-3 border-b-2 border-gray-500 pb-2">$1</h1>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>')
      
      // Bold and Italic (order matters)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
      

    // Process blocks (paragraphs and lists)
    const blocks = html.split(/(\r\n\r\n|\n\n)/);
    
    html = blocks.map(block => {
        if (block.match(/^\s*$/)) return ''; // Ignore empty blocks

        // Unordered Lists
        if (block.match(/^\s*[-*] /)) {
            const items = block.split('\n').map(item => {
                const match = item.match(/^\s*[-*] (.*)/);
                return match ? `<li>${match[1]}</li>` : '';
            }).join('');
            return `<ul class="list-disc list-inside mb-4 pl-4">${items}</ul>`;
        }

        // Ordered Lists
        if (block.match(/^\s*\d+\. /)) {
            const items = block.split('\n').map(item => {
                const match = item.match(/^\s*\d+\. (.*)/);
                return match ? `<li>${match[1]}</li>` : '';
            }).join('');
            return `<ol class="list-decimal list-inside mb-4 pl-4">${items}</ol>`;
        }
        
        // Headers are already processed, so just return them
        if (block.trim().startsWith('<h')) {
            return block;
        }

        // Paragraphs
        return `<p class="mb-4 leading-relaxed">${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
};


export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const processedHtml = parseMarkdown(markdown);

  return (
    <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
  );
};