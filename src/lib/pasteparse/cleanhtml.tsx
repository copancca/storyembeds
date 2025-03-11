export const cleanHtml = (doc: Document) => {
  // the "largest" header in the story content itself should be h4, so look
  // for each level of header and downgrade it to the next available unused
  // header tag. if there are no unused header tags, downgrade to a <p> tag
  // wrapping a <b> tag.
  let nextHeader = 4;
  ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((header) => {
    const headerTags = doc.querySelectorAll(`${header}:not([data-shrink])`);
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
  doc.body.querySelectorAll(`:not(${allowedTags.join(",")})`).forEach((el) => {
    el.remove();
  });
  const allowedAttributes = ["class", "name", "title"];
  const imgOnlyAttributes = ["alt", "height", "width"];
  doc.body.querySelectorAll("*").forEach((el) => {
    const attributes = el.attributes;
    const attributesToRemove = [];
    for (const attr of attributes) {
      if (!allowedAttributes.includes(attr.name)) {
        if (attr.name === "href" && el.tagName === "A") {
          continue;
        }
        if (imgOnlyAttributes.includes(attr.name) && el.tagName !== "IMG") {
          continue;
        }
        attributesToRemove.push(attr.name);
      }
    }
    for (const attr of attributesToRemove) {
      el.removeAttribute(attr);
    }
  });

  // now, take the innerHTML and wrap lines at each block element before
  // outputting it. this is to make it easier to read in the textarea.
  // in other words, insert a newline after each </p>, </h1>, </h2>, etc.
  const html = doc.body.innerHTML;
  const wrappedHtml = html
    .replace(/<\/p>/g, "</p>\n")
    .replace(/<br>/g, "<br>\n")
    .replace(/<\/div>/g, "</div>\n")
    .replace(/<\/pre>/g, "</pre>\n")
    .replace(/<\/table>/g, "</table>\n")
    .replace(/<\/tr>/g, "</tr>\n")
    .replace(/<\/ul>/g, "</ul>\n")
    .replace(/<\/ol>/g, "</ol>\n")
    .replace(/<\/li>/g, "</li>\n")
    .replace(/<\/h([1-6])>/g, "</h$1>\n");
  // if any block elements are longer than 250 characters, wrap them at 250
  // characters, taking care not to break words.
  const lines = wrappedHtml.split("\n");
  const wrappedLines = lines.map((line) => {
    if (line.length <= 250) return line;

    const words = line.split(" ");
    const wrappedParts = [];
    let currentLine = "";

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= 250) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        wrappedParts.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      wrappedParts.push(currentLine);
    }
    return wrappedParts.join("\n");
  });

  return wrappedLines.join("\n");
};

export default cleanHtml;
