import React, { useEffect, useState } from "react";
import { useConfigStore } from "../store/useConfigStore";
import Nav from "../components/Nav";
import "./Home.css";
import "../layouts/AO3.css";
import { copyText } from "../lib/clip";
import demoHtml from "../assets/demo.html?raw";

const CSS_FILES: { [key: string]: string } = {
  twitter: "styles/Twitter.css",
  "iphone messages": "styles/IPhoneMessages.css",
  instagram: "styles/InstagramDM.css",
  news: "styles/News.css",
};

const Home: React.FC = () => {
  useEffect(() => {
    const insta = document.createElement("link");
    insta.rel = "stylesheet";
    insta.href = import.meta.env.BASE_URL + "styles/InstagramDM.css";
    document.head.appendChild(insta);
    const iphone = document.createElement("link");
    iphone.rel = "stylesheet";
    iphone.href = import.meta.env.BASE_URL + "styles/IPhoneMessages.css";
    document.head.appendChild(iphone);
    const twitter = document.createElement("link");
    twitter.rel = "stylesheet";
    twitter.href = import.meta.env.BASE_URL + "styles/Twitter.css";
    document.head.appendChild(twitter);
    const news = document.createElement("link");
    news.rel = "stylesheet";
    news.href = import.meta.env.BASE_URL + "styles/News.css";
    document.head.appendChild(news);

    return () => {
      document.head.removeChild(insta); // clean up on unmount
      document.head.removeChild(iphone);
      document.head.removeChild(twitter);
      document.head.removeChild(news);
    };
  }, []);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [concatenatedCSS, setConcatenatedCSS] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const { workskin, toggleWorkSkin } = useConfigStore();

  const handleCheckboxChange = (file: string) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const generateCSS = async () => {
    const fetchedCSS = await Promise.all(
      selectedFiles.map(async (file) => {
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
    setConcatenatedCSS(fetchedCSS.join("\n"));
    setCopied(false);
  };

  return (
    <div className="home">
      <div className="sb-outer">
        <h1 className="sb-header">social embed generator</h1>
        <Nav />
        <p>
          this tool generates embed code for social media posts. click a link
          above to generate the html, then come here for the output css.
        </p>

        <h2 className="sb-header">embeds used</h2>
        <p>
          check the embeds you used, then click the generate button to output
          your css.
        </p>
        <ul>
          {Object.keys(CSS_FILES).map((file) => (
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
          ))}
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
        <hr />
        <h2 className="sb-header">demo</h2>
        <p className="workskin-status">
          work skin is <b>{workskin ? "on" : "off"}</b>
        </p>
        <button onClick={() => toggleWorkSkin()}>toggle work skin</button>
      </div>
      <div id="outer">
        <div id="main">
          <div id={workskin ? "workskin" : "noworkskin"}>
            <div className="preface group">
              <h2 className="title heading">story title</h2>
              <h3 className="byline heading">
                <a href="#">author</a>
              </h3>
            </div>
            <div id="chapters">
              <div className="chapter">
                <div className="chapter preface group">
                  <h3 className="title">
                    <a href="#">Chapter 1</a>: has a title
                  </h3>

                  <div id="summary" className="summary module">
                    <h3 className="heading">Summary:</h3>
                    <blockquote className="userstuff">
                      <p>
                        This is a summary for the chapter. It’s a sneak peak at
                        what’s to come.
                      </p>
                    </blockquote>
                  </div>

                  <div id="notes" className="notes module">
                    <h3 className="heading">Notes:</h3>
                    <blockquote className="userstuff">
                      <p>now some author notes</p>
                    </blockquote>
                  </div>
                </div>
                <div
                  className="userstuff"
                  dangerouslySetInnerHTML={{ __html: demoHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
