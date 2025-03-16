import React, { useState } from "react";
import { useDataStore } from "../store/useDataStore";
import { sanitizeStyle } from "../lib/style";
import parse from "../lib/pasteparse/parse";

const StoryInput: React.FC = () => {
  const {
    storyData,
    setStoryData,
    setTitle,
    setAuthor,
    setSummary,
    setNotes,
    setEndNotes,
    setChapterNumber,
    setChapterTitle,
    setCustomSectionBreak,
    setCustomSectionBreakStyle,
    title,
    author,
    summary,
    notes,
    endNotes,
    chapterNumber,
    chapterTitle,
    customSectionBreak,
    customSectionBreakStyle,
  } = useDataStore();
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(true);

  const handlePaste = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    saveFn: (html: string) => void
  ) => {
    e.preventDefault();

    const htmlInput = e.clipboardData.getData("text/html");
    const input = htmlInput || e.clipboardData.getData("text/plain");

    // get cursor position
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);

    const outputContent = parse(
      input,
      htmlInput ? "text/html" : "text/plain",
      textarea,
      customSectionBreak
    );

    // insert the processed content at cursor position
    const newValue = textBefore + outputContent + textAfter;
    saveFn(newValue);

    // set the new cursor position after the inserted content
    setTimeout(() => {
      const newPosition = start + outputContent.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStoryData(e.target.value);
  };

  return (
    <div className="story-input">
      <h2 className="sb-header">paste from word processor</h2>
      <div>
        <textarea
          placeholder="paste from a word processor (e.g. google docs)"
          value={storyData}
          onChange={handleInputChange}
          onPaste={(e) => handlePaste(e, setStoryData)}
        />
      </div>
      <h3 className="sb-header">instructions</h3>
      <p>
        paste from a word processor (e.g. google docs) and the contents of the
        text box will be html ready to be added to a work. the html will appear
        below. it does live update as you type, but this is <i>really</i> not
        meant to be a word processor or anything. this code is the furthest
        thing from optimized and <b>there is no way to save</b> so uh... just
        use this as a quick way to get your formatted text and save it to a
        work.
      </p>
      <p>
        tested (being very generous) on google docs, word online, and word 15
        (the version that comes with office 365).
      </p>
      <p>
        find a bug? report it{" "}
        <a
          href="https://github.com/copancca/storyembeds/issues"
          target="_blank"
        >
          here
        </a>
        . no promises on when or if it'll be fixed.
      </p>
      <div className="collapsible-section">
        <button
          className="collapsible-toggle"
          onClick={() => setIsCustomizationOpen(!isCustomizationOpen)}
        >
          {isCustomizationOpen ? "▼" : "▶"} customization
        </button>
        {isCustomizationOpen && (
          <div className="collapsible-fields">
            <div className="field-group">
              <label htmlFor="customSectionBreak">custom section break:</label>
              <input
                id="customSectionBreak"
                value={customSectionBreak}
                onChange={(e) => setCustomSectionBreak(e.target.value)}
                placeholder="Custom section break"
              />
              <span className="field-group-description">
                insert a custom section break style here. set this before you
                paste from a doc and the pasted content will attempt to convert
                manual section breaks to <code>&lt;hr&gt;</code> tags. if it's a
                URL, it will be used as a background image, otherwise it will be
                used as a text style. to insert the section break in your story,
                just use <code>&lt;hr&gt;</code> tags and ensure you use the
                work skin generated in the top page. this is optional, but it's
                generally nicer to use tags and also makes it a lot easier to
                keep the section breaks in sync.
              </span>
            </div>
            <div className="field-group">
              <label htmlFor="customSectionBreakStyle">
                custom section break style:
              </label>
              <input
                id="customSectionBreakStyle"
                value={customSectionBreakStyle}
                onChange={(e) =>
                  setCustomSectionBreakStyle(sanitizeStyle(e.target.value))
                }
                placeholder="Custom section break style"
              />
              <span className="field-group-description">
                this is the style of the section break. input valid css here
                (e.g. <code>margin: 3em auto;</code> or{" "}
                <code>height: 2em;</code> or{" "}
                <code>
                  height: 3em; width: 50%; background-color: red; color: blue;
                  border: 5px dotted #0ff; border-radius: 1em;
                </code>
                ). it's barely sanitized, so if you do something crazy you'll
                just break your skin.
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="collapsible-section">
        <button
          className="collapsible-toggle"
          onClick={() => setIsMetadataOpen(!isMetadataOpen)}
        >
          {isMetadataOpen ? "▼" : "▶"} story metadata
        </button>
        {isMetadataOpen && (
          <div className="collapsible-fields">
            <p className="field-group-description">
              these are all just so the preview below looks like the published
              story. summary and notes both get converted to html so you can
              paste in rich text from a doc. in the demo they appear where
              chapter notes/summary would appear, but the story level notes
              section has the same formatting.
            </p>
            <div className="field-group">
              <label htmlFor="title">title:</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="story title"
              />
            </div>

            <div className="field-group">
              <label htmlFor="author">author:</label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="author name"
              />
            </div>

            <div className="field-group">
              <label htmlFor="chapterNumber">chapter number:</label>
              <input
                id="chapterNumber"
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value))}
                min={1}
                placeholder="chapter number"
              />
            </div>

            <div className="field-group">
              <label htmlFor="chapterTitle">chapter title:</label>
              <input
                id="chapterTitle"
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="chapter title"
              />
            </div>

            <div className="field-group">
              <label htmlFor="summary">summary:</label>
              <textarea
                id="summary"
                value={summary}
                onPaste={(e) => handlePaste(e, setSummary)}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="story summary"
              />
            </div>

            <div className="field-group">
              <label htmlFor="notes">notes:</label>
              <textarea
                id="notes"
                value={notes}
                onPaste={(e) => handlePaste(e, setNotes)}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="author notes"
              />
            </div>

            <div className="field-group">
              <label htmlFor="endnotes">end notes:</label>
              <textarea
                id="endnotes"
                value={endNotes}
                onPaste={(e) => handlePaste(e, setEndNotes)}
                onChange={(e) => setEndNotes(e.target.value)}
                placeholder="end notes"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryInput;
