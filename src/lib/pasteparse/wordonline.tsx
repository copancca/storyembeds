export const processWordOnlineParagraph = (
  src: HTMLElement,
  dest: HTMLElement,
  doc: Document
) => {
  // now, blow up the span tags into the new paragraph.
  const tagStack: HTMLElement[] = [];
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let subscript = false;
  let superscript = false;
  let text = "";
  const appendToLastTag = (tagOrText: string | Node) => {
    if (typeof tagOrText === "string") {
      tagOrText = doc.createTextNode(tagOrText);
    }
    if (tagStack.length > 0) {
      tagStack[tagStack.length - 1].appendChild(tagOrText);
    } else {
      dest.appendChild(tagOrText);
    }
  };
  const appendText = () => {
    if (text.length > 0) {
      appendToLastTag(text);
      text = "";
    }
  };
  const foldTo = (index: number) => {
    // append the text to the last tag in the stack.
    appendText();
    for (let i = tagStack.length - 1; i >= index; i--) {
      const tag = tagStack.pop();
      if (!tag) {
        // this should never happen.
        throw new Error("tag stack is empty");
      }
      switch (tag.tagName.toLowerCase()) {
        case "b":
          bold = false;
          break;
        case "i":
          italic = false;
          break;
        case "u":
          underline = false;
          break;
        case "s":
          strikethrough = false;
          break;
        case "sub":
          subscript = false;
          break;
        case "sup":
          superscript = false;
          break;
      }
      appendToLastTag(tag);
    }
  };
  for (const span of src.children) {
    if (span.tagName !== "SPAN") {
      // i've never seen this, so just eat it.
      continue;
    }
    if (span.children.length === 0) {
      // no nested span tags, which i've also never seen. eat.
      continue;
    }
    const spanElement = span as HTMLSpanElement;
    let currentBold = false;
    let currentItalic = false;
    let currentUnderline = false;
    let currentStrikethrough = false;
    let currentSubscript = false;
    let currentSuperscript = false;
    // this is the tag that holds most of the styles we care about.
    if (
      parseInt(spanElement.style.fontWeight) >= 500 ||
      spanElement.style.fontWeight === "bold"
    ) {
      currentBold = true;
    }
    if (spanElement.style.fontStyle === "italic") {
      currentItalic = true;
    }
    if (spanElement.style.textDecoration.includes("underline")) {
      currentUnderline = true;
    }
    if (spanElement.style.textDecoration.includes("line-through")) {
      currentStrikethrough = true;
    }
    // sub and super, of course, are on a nested span tag along with the
    // text.
    for (const spanChild of spanElement.children) {
      switch (spanChild.tagName) {
        case "BR":
          appendText();
          appendToLastTag(doc.createElement("br"));
          continue;
        case "SPAN":
          break;
        default:
          continue;
      }
      const textSpan = spanChild as HTMLSpanElement;
      if (textSpan.style.verticalAlign === "sub") {
        currentSubscript = true;
      } else if (textSpan.style.verticalAlign === "super") {
        currentSuperscript = true;
      }
      // now, check if any of the styles have changed. if so, we need to
      // tag it appropriately. check the current tag stack and see if we
      // can nest tags (as opposed to having to create a bunch of new tags).
      const changedBold = currentBold === bold ? 0 : currentBold ? 1 : -1;
      const changedItalic =
        currentItalic === italic ? 0 : currentItalic ? 1 : -1;
      const changedUnderline =
        currentUnderline === underline ? 0 : currentUnderline ? 1 : -1;
      const changedStrikethrough =
        currentStrikethrough === strikethrough
          ? 0
          : currentStrikethrough
          ? 1
          : -1;
      const changedSubscript =
        currentSubscript === subscript ? 0 : currentSubscript ? 1 : -1;
      const changedSuperscript =
        currentSuperscript === superscript ? 0 : currentSuperscript ? 1 : -1;
      if (tagStack.length > 0) {
        // check if any styles have been removed.
        for (let i = 0; i < tagStack.length; i++) {
          const tag = tagStack[i];
          switch (tag.tagName.toLowerCase()) {
            case "b":
              if (changedBold === -1) {
                foldTo(i);
              }
              break;
            case "i":
              if (changedItalic === -1) {
                foldTo(i);
              }
              break;
            case "u":
              if (changedUnderline === -1) {
                foldTo(i);
              }
              break;
            case "s":
              if (changedStrikethrough === -1) {
                foldTo(i);
              }
              break;
            case "sub":
              if (changedSubscript === -1) {
                foldTo(i);
              }
              break;
            case "sup":
              if (changedSuperscript === -1) {
                foldTo(i);
              }
              break;
          }
        }
      }

      // now that we've closed all the tags that need to be closed, we can
      // add new tags.
      if (changedBold === 1 || (!bold && currentBold)) {
        appendText();
        tagStack.push(doc.createElement("b"));
        bold = true;
      }
      if (changedItalic === 1 || (!italic && currentItalic)) {
        appendText();
        tagStack.push(doc.createElement("i"));
        italic = true;
      }
      if (changedUnderline === 1 || (!underline && currentUnderline)) {
        appendText();
        tagStack.push(doc.createElement("u"));
        underline = true;
      }
      if (
        changedStrikethrough === 1 ||
        (!strikethrough && currentStrikethrough)
      ) {
        appendText();
        tagStack.push(doc.createElement("s"));
        strikethrough = true;
      }
      if (changedSubscript === 1 || (!subscript && currentSubscript)) {
        appendText();
        tagStack.push(doc.createElement("sub"));
        subscript = true;
      } else if (
        changedSuperscript === 1 ||
        (!superscript && currentSuperscript)
      ) {
        appendText();
        tagStack.push(doc.createElement("sup"));
        superscript = true;
      }

      // capture the text.
      text += textSpan.textContent || "";
    }
  }
  // close the last tag.
  appendText();
  foldTo(0);
};

const cleanWordOnline = (doc: Document) => {
  // each paragraph (or list) is wrapped in <div> tags. grab the first child of
  // each top-level <div> tag for additional processing
  let currentList: HTMLElement[] = [];
  let currentListOrdered = false;
  const divs = doc.querySelectorAll("body > div");
  divs.forEach((div) => {
    if (div.children.length === 0) {
      div.remove();
      return;
    }
    const child = div.children[0] as HTMLElement;
    let newListOrdered = false;
    switch (child.tagName) {
      case "P":
        if (currentList.length > 0) {
          while (currentList.length > 1) {
            currentList[currentList.length - 2].appendChild(
              currentList[currentList.length - 1]
            );
            currentList.pop();
          }
          doc.body.appendChild(currentList[0]);
          currentList = [];
        }
        let alignment = "";
        // first, check for alignment.
        switch (child.style.textAlign) {
          case "center":
            alignment = "align-center";
            break;
          case "right":
            alignment = "align-right";
            break;
          case "justify":
            alignment = "align-justify";
            break;
        }
        // paragraph tags can include titles and headers, so we need to catch
        // those to convert them to the appropriate html tags. it won't be
        // perfect, but check if the first child's first child (ugh) is a
        // <span> tag.
        if (child.children.length == 0) {
          // an empty paragraph. we actually do want to keep this, but we can
          // stop processing here.
          doc.body.appendChild(doc.createElement("p"));
          return;
        }
        const headerCheckSpan = child.querySelector("span>span");
        let newTag = "p";
        if (headerCheckSpan) {
          switch (headerCheckSpan.getAttribute("data-ccp-parastyle")) {
            case "Title":
              newTag = "h1";
              break;
            case "heading 1":
              newTag = "h2";
              break;
            case "heading 2":
              newTag = "h3";
              break;
            case "heading 3":
              newTag = "h4";
              break;
          }
        }
        const newParagraph = doc.createElement(newTag);
        if (alignment !== "") {
          newParagraph.classList.add(alignment);
        }
        processWordOnlineParagraph(child, newParagraph, doc);
        doc.body.appendChild(newParagraph);
        break;
      case "OL":
      case "UL":
        if (child.tagName === "OL") {
          newListOrdered = true;
        }
        const listItem = child.children[0] as HTMLElement;
        if (listItem.tagName !== "LI") {
          // doing something weird. just eat it and move on.
          div.remove();
          return;
        }
        const targetDepth = parseInt(
          listItem.getAttribute("data-aria-level") || "0"
        );
        if (
          currentListOrdered !== newListOrdered &&
          currentList.length === targetDepth
        ) {
          let target = doc.body;
          if (currentList.length > 1) {
            target = currentList[currentList.length - 2];
          }
          target.appendChild(currentList[currentList.length - 1]);
          currentList.pop();
          currentList.push(doc.createElement(newListOrdered ? "ol" : "ul"));
        }
        while (currentList.length < targetDepth) {
          currentList.push(doc.createElement(newListOrdered ? "ol" : "ul"));
        }
        currentListOrdered = newListOrdered;
        const newListItem = doc.createElement("li");
        while (listItem.firstChild) {
          const child = listItem.firstElementChild as HTMLElement;
          if (child.tagName === "P") {
            processWordOnlineParagraph(
              listItem.firstChild as HTMLElement,
              newListItem,
              doc
            );
          }
          child.remove();
        }
        currentList[currentList.length - 1].appendChild(newListItem);
        break;
      default:
        return;
    }
    div.remove();
  });
  if (currentList.length > 0) {
    while (currentList.length > 1) {
      currentList[currentList.length - 2].appendChild(
        currentList[currentList.length - 1]
      );
      currentList.pop();
    }
    doc.body.appendChild(currentList[0]);
    currentList = [];
  }
  // when pasting text from within a single paragraph, the content actually
  // comes in just a series of <span> tags. wrap this in a <p> tag.
  const spans = doc.querySelectorAll("body > span");
  const srcP = doc.createElement("p");
  spans.forEach((span) => {
    srcP.appendChild(span.cloneNode(true));
    span.remove();
  });
  const destP = doc.createElement("p");
  processWordOnlineParagraph(srcP, destP, doc);
  doc.body.appendChild(destP);
};

export default cleanWordOnline;
