import { isValidElement } from 'react';

function escapeHtml(value: string): string {
  return value;
}

export function renderToHTML(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return escapeHtml(node.toString());
  }

  if (typeof node === 'boolean' || typeof node === 'undefined' || node === null) {
    return '';
  }

  if (Array.isArray(node)) {
    return node.map((child) => renderToHTML(child)).join('');
  }

  if (typeof node === 'object') {
    if (isValidElement(node)) {
      if (typeof node.type === 'string') {
        let html = '<' + node.type;
        if (typeof node.props === 'object' && node.props !== null) {
          Object.entries(node.props).forEach(([key, value]) => {
            if (key !== 'children') {
              html += ' ';
              html += key;
              html += '=';
              html += escapeHtml(value);
            }
          });
          html += '>';
          const children = Reflect.get(node.props, 'children');
          html += renderToHTML(children);
          html += '</' + node.type + '>';
          return html;
        }
      }
      if (typeof node.type === 'function') {
        console.log((node.type as any)(node.props));
      }
    }

    throw new Error('Cannot render an object.');
  }

  throw new Error('Not implemented.');
}
