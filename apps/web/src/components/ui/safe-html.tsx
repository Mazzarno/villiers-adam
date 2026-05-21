'use client';

import * as React from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'span', 'div', 'table',
  'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure',
  'figcaption', 'hr', 'sup', 'sub', 'mark',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'class', 'id', 'src', 'alt',
  'width', 'height', 'title', 'colspan', 'rowspan',
];

const SAFE_URI_PATTERN = /^(?:(?:https?|mailto|tel):|\/|#)/i;

export function SafeHTML({ html, className, as: Tag = 'div' }: SafeHTMLProps) {
  const [sanitized, setSanitized] = React.useState('');

  React.useEffect(() => {
    import('dompurify').then((DOMPurify) => {
      const clean = DOMPurify.default.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ADD_ATTR: ['target'],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
        ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
      });

      const container = document.createElement('div');
      container.innerHTML = clean;
      container.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
        anchor.setAttribute('rel', 'noopener noreferrer nofollow');
      });
      setSanitized(container.innerHTML);
    });
  }, [html]);

  if (!sanitized) return null;

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
