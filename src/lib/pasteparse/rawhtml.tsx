export const cleanRawHtml = (doc: Document) => {
  // for this we basically just want to remove deprecated tags and replace them
  // with their new equivalents.
  const deprecatedTags = {
    center: "div",
    strike: "s",
    tt: "code",
    small: "span",
    big: "span",
  };
  for (const [tag, replacement] of Object.entries(deprecatedTags)) {
    const elements = doc.querySelectorAll(tag);
    elements.forEach((element) => {
      const newElement = doc.createElement(replacement);
      newElement.innerHTML = element.innerHTML;
      if (tag === "center") {
        newElement.classList.add("align-center");
      }
      if (tag === "small") {
        newElement.classList.add("text-small");
      }
      if (tag === "big") {
        newElement.classList.add("text-big");
      }
      element.replaceWith(newElement);
    });
  }
};

export default cleanRawHtml;
