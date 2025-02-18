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
      alert("HTML copied to clipboard!");
    })
    .catch((err) => {
      alert("Failed to copy: " + err);
    });
}
