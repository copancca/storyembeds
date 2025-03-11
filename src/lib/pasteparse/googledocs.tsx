export const cleanGoogleDocs = (doc: Document) => {
  // remove any wrapper <b> tag (that google docs sometimes puts around the
  // whole document)
  doc.querySelectorAll("b[id^='docs-internal-guid-']").forEach((bTag) => {
    while (bTag.firstChild) {
      bTag.parentNode?.insertBefore(bTag.firstChild, bTag);
    }
    bTag.remove();
  });

  // some text (maybe only the last paragraph) can sometimes come without
  // a <p> tag. so we need to wrap it in a <p> tag. (fortunately all text is
  // wrapped in <span> tags at least). loop through all the children of the
  // body, and group consecutive <span> tags into a <p> tag.
  for (
    let startIndex = 0;
    startIndex < doc.body.children.length;
    startIndex++
  ) {
    const child = doc.body.children[startIndex];
    if (child.tagName === "SPAN") {
      const newParagraph = doc.createElement("p");
      while (
        startIndex < doc.body.children.length &&
        doc.body.children[startIndex].tagName === "SPAN"
      ) {
        const child = doc.body.children[startIndex];
        if (child.tagName === "SPAN") {
          newParagraph.appendChild(child.cloneNode(true));
          child.remove();
        } else {
          break;
        }
      }
      if (startIndex < doc.body.children.length) {
        doc.body.insertBefore(newParagraph, doc.body.children[startIndex]);
      } else {
        doc.body.appendChild(newParagraph);
      }
    }
  }

  // text styles will be held in a ton of child <span> tags. find all the
  // <p> tags, and then find the <span> tags within each <p> tag.

  doc.querySelectorAll("p").forEach((pTag) => {
    // check for text-align style, and if it's set, add a helper class to
    // the <p> tag.
    switch (pTag.style.textAlign) {
      case "center":
        pTag.classList.add("align-center");
        break;
      case "right":
        pTag.classList.add("align-right");
        break;
      case "justify":
        pTag.classList.add("align-justify");
        break;
    }

    // for the span styles, prefer <i> and <b> over <em> and <strong>.
    // that's just personal preference because i believe that the choice of
    // italics and bold itself has pragmatic meaning and it should not be
    // (potentially) lost. (if any alternate/accessible reader users have a
    // different take i'm definitely open to being convinced otherwise.)
    pTag.querySelectorAll("span").forEach((spanTag) => {
      const text = spanTag.textContent || "";
      if (!text.trim()) return;

      let changed = false;
      let newTag: HTMLElement = spanTag.cloneNode(true) as HTMLElement;

      // check font weight for bold
      if (
        parseInt(spanTag.style.fontWeight) >= 500 ||
        spanTag.style.fontWeight === "bold"
      ) {
        const bTag = doc.createElement("b");
        bTag.appendChild(newTag);
        newTag = bTag;
        changed = true;
      }

      // check font style for italics
      if (spanTag.style.fontStyle === "italic") {
        const iTag = doc.createElement("i");
        iTag.appendChild(newTag);
        newTag = iTag;
        changed = true;
      }

      // check text decoration for underline/strikethrough
      if (spanTag.style.textDecoration.includes("underline")) {
        // for underline, we also need to make sure that the current spanTag
        // is not inside an <a> tag. in that case, we don't want to add the
        // <u> tag. check the parents between the spanTag and the pTag to
        // make sure that there is no <a> tag. the edge case here is that
        // the <a> tag might have been manually underlined, but hopefully
        // that's rare.
        let currentTag = spanTag.parentElement;
        let isInLink = false;
        while (currentTag && currentTag !== pTag) {
          if (currentTag.tagName === "A") {
            isInLink = true;
            break;
          }
          currentTag = currentTag.parentElement;
        }
        if (!isInLink) {
          const uTag = doc.createElement("u");
          uTag.appendChild(newTag);
          newTag = uTag;
          changed = true;
        }
      }
      if (spanTag.style.textDecoration.includes("line-through")) {
        const sTag = doc.createElement("s");
        sTag.appendChild(newTag);
        newTag = sTag;
        changed = true;
      }

      // check for subscript/superscript. honestly i'd guess the vast
      // majority of use cases here are when people are trying to have
      // some kind of visual effect (which ought to be achieved with css
      // classes, not html tags so users can disable the work skin). but
      // since they are still valid html tags, we can handle them. (i am
      // not budging on <center> tags, though.)
      if (spanTag.style.verticalAlign === "sub") {
        const subTag = doc.createElement("sub");
        subTag.appendChild(newTag);
        newTag = subTag;
        changed = true;
      } else if (spanTag.style.verticalAlign === "super") {
        const supTag = doc.createElement("sup");
        supTag.appendChild(newTag);
        newTag = supTag;
        changed = true;
      }

      if (changed) {
        spanTag.replaceWith(newTag);
      }
    });
  });

  // bump all the text up to the parent <p> tag
  doc.querySelectorAll("span").forEach((el) => {
    while (el.firstChild) {
      el.parentNode?.insertBefore(el.firstChild, el);
    }
    el.remove();
  });
};

export default cleanGoogleDocs;
