import cleanHtml from "./cleanhtml";
import cleanGoogleDocs from "./googledocs";
import cleanWordOnline from "./wordonline";
import cleanWord from "./word";
import cleanRawHtml from "./rawhtml";

// Make an enum for the doc source (google docs, word online, etc.)
enum DocSource {
  UNKNOWN = 0,
  GOOGLE_DOCS = 1,
  WORD_ONLINE = 2,
  WORD = 3,
}

const getDocSource = (htmlContent: string): DocSource => {
  if (htmlContent.includes("docs-internal-guid")) {
    return DocSource.GOOGLE_DOCS;
  } else if (
    htmlContent.includes("paraeid") ||
    htmlContent.includes(`class="TextRun`)
  ) {
    return DocSource.WORD_ONLINE;
  } else if (htmlContent.includes("<w:WordDocument")) {
    return DocSource.WORD;
  }
  return DocSource.UNKNOWN;
};

const convertSectionBreaks = (doc: Document, customSectionBreak: string) => {
  // check if the section break is a URL, and if so, use it as a background image.
  const isUrl = customSectionBreak.startsWith("http");

  for (const child of doc.body.children) {
    switch (child.tagName) {
      case "P":
        if (isUrl) {
          if (
            child.children.length === 1 &&
            child.children[0].tagName === "IMG"
          ) {
            const img = child.children[0] as HTMLImageElement;
            if (img.src === customSectionBreak) {
              const hr = doc.createElement("hr");
              child.replaceWith(hr);
            }
          }
        } else {
          if (child.textContent?.trim() === customSectionBreak.trim()) {
            const hr = doc.createElement("hr");
            child.replaceWith(hr);
          }
        }
        break;
      case "DIV":
        if (child.classList.contains("align-center")) {
          if (child.children.length === 1) {
            if (child.children[0].tagName === "P") {
              const p = child.children[0] as HTMLParagraphElement;
              if (isUrl) {
                if (
                  p.children.length === 1 &&
                  p.children[0].tagName === "IMG"
                ) {
                  const img = p.children[0] as HTMLImageElement;
                  if (img.src === customSectionBreak) {
                    const hr = doc.createElement("hr");
                    child.replaceWith(hr);
                  }
                }
              } else {
                if (p.textContent?.trim() === customSectionBreak.trim()) {
                  const hr = doc.createElement("hr");
                  child.replaceWith(hr);
                }
              }
            } else if (child.children[0].tagName === "IMG") {
              const img = child.children[0] as HTMLImageElement;
              if (img.src === customSectionBreak) {
                const hr = doc.createElement("hr");
                child.replaceWith(hr);
              }
            }
          }
        }
        break;
    }
  }
};

export const parse = (
  inputContent: string,
  mimeType: string,
  textarea: HTMLTextAreaElement,
  customSectionBreak?: string
): string => {
  let outputContent = inputContent;

  if (mimeType !== "text/html") {
    // check if the plain text looks like HTML, and if so let it through
    if (!(inputContent.includes("<") && inputContent.includes(">"))) {
      // reduce 3+ newlines to 2
      outputContent = outputContent.replace(/\n\n\n/g, "\n\n");
      // replace double-newlines with <p> tags and single-newlines with <br> tags
      const paragraphs = outputContent.split("\n\n");
      outputContent = paragraphs
        .map((p) => {
          return `<p>${p.replace(/\n/g, "<br>\n")}</p>\n`;
        })
        .join("");
    }
  }

  const docSource = getDocSource(outputContent);
  const parser = new DOMParser();
  const doc = parser.parseFromString(outputContent, "text/html");

  switch (docSource) {
    case DocSource.GOOGLE_DOCS:
      cleanGoogleDocs(doc);
      break;
    case DocSource.WORD_ONLINE:
      cleanWordOnline(doc);
      break;
    case DocSource.WORD:
      cleanWord(doc);
      break;
    default:
      cleanRawHtml(doc);
      break;
  }
  cleanHtml(doc);

  if (customSectionBreak && customSectionBreak.trim() !== "") {
    convertSectionBreaks(doc, customSectionBreak);
  }

  // check if the content coming back is a single paragraph and there is
  // already some text in the textarea. if so, just return the innerHTML of
  // the paragraph.
  const singleP =
    doc.body.children.length === 1 &&
    doc.body.children[0].tagName === "P" &&
    doc.body.children[0].classList.length === 0;
  if (singleP && textarea.value.length > 0) {
    return doc.body.children[0].innerHTML;
  }

  // now, take the innerHTML and wrap lines at each block element before
  // outputting it. this is to make it easier to read in the textarea.
  // in other words, insert a newline after each </p>, </h1>, </h2>, etc.
  const html = doc.body.innerHTML;
  const wrappedHtml = html
    .replace(/<\/p>[^\n]/g, "</p>\n")
    .replace(/<br>[^\n]/g, "<br>\n")
    .replace(/<hr>[^\n]/g, "<hr>\n")
    .replace(/<\/div>[^\n]/g, "</div>\n")
    .replace(/<\/pre>[^\n]/g, "</pre>\n")
    .replace(/<\/table>[^\n]/g, "</table>\n")
    .replace(/<\/tr>[^\n]/g, "</tr>\n")
    .replace(/<\/ul>[^\n]/g, "</ul>\n")
    .replace(/<\/ol>[^\n]/g, "</ol>\n")
    .replace(/<\/li>[^\n]/g, "</li>\n")
    .replace(/<\/h([1-6])>[^\n]/g, "</h$1>\n");
  // if any block elements are longer than 250 characters, wrap them at 250
  // characters, taking care not to break words.
  const lines = wrappedHtml.split("\n");
  let inPre = false;
  const wrappedLines = lines.map((line) => {
    if (line.includes("<pre ") || line.includes("<pre>")) {
      inPre = true;
    }
    if (inPre) {
      if (line.includes("</pre>")) {
        inPre = false;
      }
      return line;
    }
    if (line.length <= 250) {
      if (line.length === 0 && inPre) {
        return " ";
      }
      return line;
    }

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

export default parse;
