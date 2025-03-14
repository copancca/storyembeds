const cleanWord = (doc: Document) => {
  let currentList: HTMLElement[] = [];
  let currentListOrdered = false;
  doc.querySelectorAll("body > p").forEach((el) => {
    const p = el as HTMLParagraphElement;
    // check the class on the paragraph.
    if (p.classList.length === 0) {
      // no idea what this is, but we'll just let it go.
      return;
    }
    // in my version of word there is only one class on each paragraph, but i
    // didn't test that thoroughly. we won't worry about it.
    const msoClass = p.classList.item(0);
    p.removeAttribute("class");

    // now check the alignment.
    switch (p.style.textAlign) {
      case "center":
        p.classList.add("align-center");
        break;
      case "right":
        p.classList.add("align-right");
        break;
      case "justify":
        p.classList.add("align-justify");
        break;
    }

    switch (msoClass) {
      case "MsoNormal":
        if (currentList.length > 0) {
          while (currentList.length > 1) {
            currentList[currentList.length - 2].appendChild(
              currentList[currentList.length - 1]
            );
            currentList.pop();
          }
          doc.body.insertBefore(currentList[0], p);
          currentList = [];
        }
        return;
      case "MsoTitle":
        // this is a title. we need to process it as a title. this is a little
        // tricky since word automatically pastes "Heading 1" styles as <h1>
        // tags. for now we'll live with them both being h1s.
        const title = doc.createElement("h1");
        // elevate all sub elements to the title.
        for (const child of p.childNodes) {
          title.appendChild(child);
          const alignClass = p.classList.item(0);
          if (alignClass) {
            title.classList.add(alignClass);
          }
        }
        p.replaceWith(title);
        return;
      case "MsoListParagraphCxSpFirst":
      case "MsoListParagraphCxSpMiddle":
      case "MsoListParagraphCxSpLast":
        // this is a (first) list item, so create a list.
        const nodesToRemove = [];
        let deleting = false;
        for (const child of p.childNodes) {
          if (child.nodeType === Node.COMMENT_NODE) {
            if (child.textContent === "[if !supportLists]") {
              deleting = true;
            }
          }
          if (deleting) {
            nodesToRemove.push(child);
            if (
              child.nodeType === Node.COMMENT_NODE &&
              child.textContent === "[endif]"
            ) {
              deleting = false;
            }
          }
        }
        deleting = false;
        for (const node of nodesToRemove) {
          node.remove();
        }
        // the list style is in the style attribute, but only in the mso-list
        // attribute (which we can't access using getComputedStyle). so we'll
        // just match on regex. the format is:
        // mso-list:l[01] level[\d+] lfo[01];
        // where l is the list type (1 for unordered, 0 for ordered), level is
        // the list level, and lfo is... something.
        const listStyle = p.getAttribute("style") || "";
        const listStyleMatch = listStyle.match(
          /(?:^|;)mso-list:l([01]) level([\d+]) .*/
        );
        const listTypeOrdered = listStyleMatch
          ? listStyleMatch[1] === "0"
          : false;
        const targetDepth = listStyleMatch ? parseInt(listStyleMatch[2]) : 1;
        while (
          currentList.length > 1 &&
          (currentList.length > targetDepth ||
            (currentList.length === targetDepth &&
              currentListOrdered !== listTypeOrdered))
        ) {
          currentList[currentList.length - 2].appendChild(
            currentList[currentList.length - 1]
          );
          currentList.pop();
        }
        if (
          currentList.length === 1 &&
          targetDepth === 1 &&
          currentListOrdered !== listTypeOrdered
        ) {
          doc.body.insertBefore(currentList[0], p);
          currentList = [];
        }
        while (currentList.length < targetDepth) {
          currentList.push(doc.createElement(listTypeOrdered ? "ol" : "ul"));
          currentListOrdered = listTypeOrdered;
        }

        const listItem = doc.createElement("li");
        for (const child of p.childNodes) {
          listItem.appendChild(child);
        }
        currentList[currentList.length - 1].appendChild(listItem);
        p.remove();
        return;
      default:
        p.classList.add(msoClass || "unknown");
    }
  });
};

export default cleanWord;
