import React, { useState } from "react";
import { useDataStore } from "../store/useDataStore";
import Nav from "../components/Nav";
import "./Home.css";
import { copyText } from "../lib/clip";
import { sectionBreakStyle } from "../lib/style";

const CSS_FILES: { [key: string]: string } = {
  twitter: "styles/Twitter.css",
  "iphone messages": "styles/IPhoneMessages.css",
  instagram: "styles/InstagramDM.css",
  news: "styles/News.css",
  basic: "styles/Basic.css",
};

const Home: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [concatenatedCSS, setConcatenatedCSS] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const { customSectionBreak, customSectionBreakStyle } = useDataStore();

  const handleCheckboxChange = (file: string) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const generateCSS = async () => {
    const fetchedCSS = await Promise.all(
      ["basic", ...selectedFiles].map(async (file) => {
        try {
          const response = await fetch(
            import.meta.env.BASE_URL + CSS_FILES[file],
            { cache: "no-cache" }
          );
          if (!response.ok) {
            return `/* Failed to load ${file} (HTTP ${response.status}) */\n`;
          }
          return await response.text();
        } catch (error) {
          return `/* Failed to load ${file} */\n`;
        }
      })
    );
    const combinedCSS =
      fetchedCSS.join("\n") +
      (customSectionBreak
        ? "\n" + sectionBreakStyle(customSectionBreak, customSectionBreakStyle)
        : "");
    setConcatenatedCSS(combinedCSS);
    setCopied(false);
  };

  return (
    <div className="home">
      <link
        rel="stylesheet"
        href={import.meta.env.BASE_URL + `styles/AO3.css`}
      />
      <div className="sb-outer">
        <h1 className="sb-header">ao3 css/html generator</h1>
        <Nav />
        <p>
          this page generates a work skin for ao3 that is useful for generating
          fake social media embeds and other things. select the embeds you want
          to use, then click the generate button to output the css.
        </p>
        <p>
          there's also a tool for pasting from word processors like gdocs into
          html that works with ao3. you can get it from the "doc2html" link in
          the nav. if you only use that, the only css you'll need is the basic
          one, and you can just copy that.
        </p>
        <p>
          feel free to edit the css how you like. this is just a convenience
          tool. i definitely have a bias towards standards-compliant html so
          you'll notice i don't ever use like <code>&lt;center&gt;</code> or
          <code>&lt;small&gt;</code> tags (which obviously means readers who
          disable work skins won't see those changes).
        </p>

        <h2 className="sb-header">embeds used</h2>
        <p>
          check the embeds you used, then click the generate button to output
          your css.
        </p>
        <ul>
          {Object.keys(CSS_FILES).map(
            (file) =>
              file !== "basic" && (
                <li key={file}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file)}
                      onChange={() => handleCheckboxChange(file)}
                    />
                    {file}
                  </label>
                </li>
              )
          )}
        </ul>
        <button onClick={generateCSS}>generate css</button>
        <textarea
          placeholder="css output"
          readOnly
          value={concatenatedCSS}
          onClick={() => {
            if (concatenatedCSS && !copied) {
              copyText(concatenatedCSS, "generated css");
              setCopied(true);
            }
          }}
        ></textarea>
        <p>
          {concatenatedCSS
            ? copied
              ? "copied!"
              : "click the text box to copy the generated css"
            : "no css generated yet"}
        </p>
      </div>
    </div>
  );
};

export default Home;
