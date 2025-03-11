import React, { useState } from "react";
import { useConfigStore } from "../store/useConfigStore";
import Nav from "./Nav";
import cleanHtml from "../lib/pasteparse/cleanhtml";
import cleanGoogleDocs from "../lib/pasteparse/googledocs";
import cleanWordOnline from "../lib/pasteparse/wordonline";

interface StoryInputProps {
  buttonText?: string;
  titleText?: string;
}

// Make an enum for the doc source (google docs, word online, etc.)
enum DocSource {
  UNKNOWN = 0,
  GOOGLE_DOCS = 1,
  WORD_ONLINE = 2,
}

const getDocSource = (htmlContent: string): DocSource => {
  if (htmlContent.includes("docs-internal-guid")) {
    return DocSource.GOOGLE_DOCS;
  } else if (htmlContent.includes("paraeid")) {
    return DocSource.WORD_ONLINE;
  }
  return DocSource.UNKNOWN;
};

const StoryInput: React.FC<StoryInputProps> = ({ buttonText, titleText }) => {
  const { storyData, setStoryData, setRenderedStory } = useConfigStore();
  const [error, setError] = useState<string | null>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    // Get the clipboard data as HTML
    const htmlContent = e.clipboardData.getData("text/html");
    const plainText = e.clipboardData.getData("text/plain");

    // If HTML content is available, use it; otherwise, fall back to plain text
    if (htmlContent) {
      const docSource = getDocSource(htmlContent);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      switch (docSource) {
        case DocSource.GOOGLE_DOCS:
          cleanGoogleDocs(doc);
          break;
        case DocSource.WORD_ONLINE:
          cleanWordOnline(doc);
          break;
        default:
          break;
      }
      setStoryData(cleanHtml(doc));
    } else {
      setStoryData(plainText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStoryData(e.target.value);
  };

  const saveConfig = () => {
    try {
      setRenderedStory(storyData);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An error occurred.");
      }
    }
  };

  return (
    <div id="controls">
      <h2 className="sb-header">{titleText || "paste from word processor"}</h2>
      <Nav />
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <textarea
          placeholder="paste from a word processor (e.g. google docs)"
          value={storyData}
          onChange={handleInputChange}
          onPaste={handlePaste}
        />
        <button onClick={saveConfig}>{buttonText || "show rendered"}</button>
      </div>
      <h3 className="sb-header">instructions</h3>
      <p>
        paste from a word processor (e.g. google docs) and the contents of the
        text box will be html ready to be added to a work. click the button to
        preview the html it generates. you'll still have to replace any embeds
        from the other pages with that output.
      </p>
    </div>
  );
};

export default StoryInput;
