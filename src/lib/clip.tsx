export function copyThreadHTML(
  index: number,
  setOutput: (output: string) => void
) {
  const container = document.getElementById(`thread-block-${index}`);
  const htmlContent = container ? container.innerHTML : "";
  setOutput(htmlContent);
  navigator.clipboard
    .writeText(htmlContent)
    .then(() => {
      alert("html copied to clipboard!");
    })
    .catch((err) => {
      alert("failed to copy: " + err);
    });
}

export function copyText(text: string, description?: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert((description ? description : "text") + " copied to clipboard");
    })
    .catch((err) => {
      alert("failed to copy: " + err);
    });
}
