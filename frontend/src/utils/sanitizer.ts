export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) {
    return '';
  }

  const parser: DOMParser = new DOMParser();
  const doc: Document = parser.parseFromString(dirtyHtml, 'text/html');

  const dangerousTags: NodeListOf<Element> = doc.querySelectorAll(
    'script, iframe, object, embed, style, link',
  );

  for (const tag of dangerousTags) {
    tag.remove();
  }

  const allElements: NodeListOf<Element> = doc.querySelectorAll('*');

  for (const element of allElements) {
    const attributes: Attr[] = Array.from(element.attributes);

    for (const attr of attributes) {
      const attrName: string = attr.name.toLowerCase();
      const attrValue: string = attr.value.toLowerCase();

      if (attrName.startsWith('on')) {
        element.removeAttribute(attrName);
        continue;
      }

      if (attrName === 'href' && attrValue.includes('javascript:')) {
        element.removeAttribute(attrName);
      }
    }
  }

  return doc.body.innerHTML;
}

export function highlightEmails(html: string): string {
  if (!html) {
    return '';
  }

  // Email regex pattern
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

  // Replace emails with blue-colored span
  const highlightedHtml = html.replace(
    emailRegex,
    '<span style="color: blue; font-weight: 500;">$1</span>',
  );

  return highlightedHtml;
}
