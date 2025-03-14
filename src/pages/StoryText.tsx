import React, { useEffect } from "react";
import { useConfigStore } from "../store/useConfigStore";
import Nav from "../components/Nav";
import StoryInput from "../components/StoryInput";
import "./Home.css";
import "../layouts/AO3.css";
import { useDataStore } from "../store/useDataStore";
import { sectionBreakStyle } from "../lib/style";

const StoryText: React.FC = () => {
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
    const basic = document.createElement("link");
    basic.rel = "stylesheet";
    basic.href = import.meta.env.BASE_URL + "styles/Basic.css";
    document.head.appendChild(basic);

    return () => {
      document.head.removeChild(insta); // clean up on unmount
      document.head.removeChild(iphone);
      document.head.removeChild(twitter);
      document.head.removeChild(news);
      document.head.removeChild(basic);
    };
  }, []);
  const { workskin, toggleWorkSkin } = useConfigStore();
  const {
    title,
    author,
    summary,
    notes,
    chapterTitle,
    chapterNumber,
    renderedStory,
    customSectionBreak,
    customSectionBreakStyle,
  } = useDataStore();

  return (
    <div className="home">
      <div className="sb-outer">
        <h1 className="sb-header">doc to html</h1>
        <Nav />
        <StoryInput />
        <hr />
        <h2 className="sb-header">preview</h2>
        <p className="workskin-status">
          work skin is <b>{workskin ? "on" : "off"}</b>
        </p>
        <button onClick={() => toggleWorkSkin()}>toggle work skin</button>
      </div>
      {customSectionBreak && (
        <style>
          {sectionBreakStyle(customSectionBreak, customSectionBreakStyle)}
        </style>
      )}
      <div id="outer">
        <div id="main">
          <div id={workskin ? "workskin" : "noworkskin"}>
            <div className="preface group">
              <h2 className="title heading">{title || "story title"}</h2>
              <h3 className="byline heading">
                <a href="#">{author || "author"}</a>
              </h3>
            </div>
            <div id="chapters">
              <div className="chapter">
                <div className="chapter preface group">
                  <h3 className="title">
                    <a href="#">Chapter {chapterNumber || 1}</a>:{" "}
                    {chapterTitle || "has a title"}
                  </h3>

                  <div id="summary" className="summary module">
                    <h3 className="heading">Summary:</h3>
                    <blockquote className="userstuff">
                      <p>
                        {summary ||
                          "This is a summary for the chapter. It’s a sneak peak at what’s to come."}
                      </p>
                    </blockquote>
                  </div>

                  <div id="notes" className="notes module">
                    <h3 className="heading">Notes:</h3>
                    <blockquote className="userstuff">
                      <p>{notes || "now some author notes"}</p>
                    </blockquote>
                  </div>
                </div>
                <div
                  className="userstuff"
                  dangerouslySetInnerHTML={{ __html: renderedStory }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryText;
