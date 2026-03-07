import React from 'react';

interface VariableHighlighterProps {
  query: string;
}

export const VariableHighlighter: React.FC<VariableHighlighterProps> = ({ query }) => {
  const parts = String(query).split(/(\{\{Variable:\w+\}\})/g);
  return (
    <>
      {parts.map((part, idx) =>
        /^\{\{Variable:\w+\}\}$/.test(part) ? (
          <span key={`var-${idx}-${part}`} className="text-amber-500 font-bold dark:text-amber-400">{part}</span>
        ) : (
          <span key={`text-${idx}-${part}`}>{part}</span>
        )
      )}
    </>
  );
};
