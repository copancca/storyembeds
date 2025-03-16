export const sectionBreakStyle = (
  customSectionBreak?: string,
  customSectionBreakStyle?: string
) => {
  if (!customSectionBreak) {
    return "";
  }
  const sectionBreakURL = customSectionBreak?.startsWith("http")
    ? customSectionBreak
    : undefined;
  const sectionBreakText = sectionBreakURL ? "" : customSectionBreak?.trim();
  return `#workskin .userstuff>hr {
  border: 0 none;
  text-align: center;
  color: #2a2a2a;
  width: 100%;
}

#workskin .userstuff>hr::after {
  content: "${sectionBreakText}";
  display: block;
  margin: 0 auto;${
    sectionBreakURL
      ? `
  background-image: url(${sectionBreakURL});
    width: 100%; height: 1.5em; background-position: center;
    background-size: contain; background-repeat: no-repeat;`
      : ""
  }${
    customSectionBreakStyle
      ? `
  ${customSectionBreakStyle}`
      : ""
  }
}`;
};

export const sanitizeStyle = (style: string) => {
  // the input should be valid inline css
  // e.g. "background-color: red; color: blue;"
  // we'll be dropping it into a css definition, but we don't need to check
  // for too many things - just make sure it won't break the css file with
  // invalid css
  let sanitized = "";
  // strip out any comments, and close a comment if it's open
  let commentOpen = false;
  // walk through the input and build the sanitized string. comments start
  // with /* and end with */.
  for (let i = 0; i < style.length; i++) {
    const char = style[i];
    if (char === "/" && i + 1 < style.length && style[i + 1] === "*") {
      commentOpen = !commentOpen;
      i++;
    } else if (commentOpen) {
      if (char === "*" && i + 1 < style.length && style[i + 1] === "/") {
        commentOpen = !commentOpen;
        i++;
      }
    } else {
      sanitized += char;
    }
  }

  // remove any lingering open quotes that have been opened but not closed -
  // annoying, but walk through and keep track of the current outer open
  // quote and close it if it isn't at the end.
  let outerQuote = "";
  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    if (char === '"' || char === "'") {
      if (outerQuote === "") {
        outerQuote = char;
      } else if (outerQuote === char) {
        outerQuote = "";
      }
    }
  }
  return sanitized + outerQuote;
};
