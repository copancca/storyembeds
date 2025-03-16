export const cleanHtml = (doc: Document) => {
  // the "largest" header in the story content itself should be h4, so look
  // for each level of header and downgrade it to the next available unused
  // header tag. if there are no unused header tags, downgrade to a <p> tag
  // wrapping a <b> tag.
  let nextHeader = 4;
  ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((header) => {
    const headerTags = doc.querySelectorAll(
      `body>${header}:not([data-shrink])`
    );
    if (headerTags.length > 0) {
      headerTags.forEach((tag) => {
        let newTag = doc.createElement(nextHeader > 6 ? "b" : `h${nextHeader}`);
        newTag.setAttribute("data-shrink", "true");
        while (tag.firstChild) {
          newTag.appendChild(tag.firstChild);
        }
        if (nextHeader > 6) {
          const bTag = doc.createElement("p");
          bTag.appendChild(newTag);
          newTag = bTag;
        }
        tag.replaceWith(newTag);
      });
      nextHeader++;
    }
  });

  const allowedTags = [
    "a",
    "abbr",
    "address",
    "b",
    "blockquote",
    "br",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "dd",
    "del",
    "details",
    "dfn",
    "div",
    "dl",
    "dt",
    "em",
    "figcaption",
    "figure",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "ins",
    "kbd",
    "li",
    "ol",
    "p",
    "pre",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "span",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
    "var",
  ];
  const walker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_ELEMENT
  );
  const nodesToRemove = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      !allowedTags.includes((node as HTMLElement).tagName.toLowerCase())
    ) {
      nodesToRemove.push(node as HTMLElement);
    } else if (node.nodeType === Node.COMMENT_NODE) {
      nodesToRemove.push(node as Comment);
    }
  }
  for (const node of nodesToRemove) {
    node.remove();
  }
  const allowedAttributes = ["class", "name", "title"];
  const imgOnlyAttributes = ["alt", "height", "width", "src"];
  doc.body.querySelectorAll("*").forEach((el) => {
    const attributes = el.attributes;
    const attributesToRemove = [];
    for (const attr of attributes) {
      if (!allowedAttributes.includes(attr.name)) {
        if (attr.name === "href" && el.tagName === "A") {
          continue;
        }
        if (imgOnlyAttributes.includes(attr.name) && el.tagName === "IMG") {
          continue;
        }
        attributesToRemove.push(attr.name);
      }
    }
    for (const attr of attributesToRemove) {
      el.removeAttribute(attr);
    }
  });

  doc.body.querySelectorAll("p").forEach((p) => {
    if (p.innerHTML.trim() === "") {
      p.innerHTML = "&nbsp;";
    }
  });
};

export default cleanHtml;
