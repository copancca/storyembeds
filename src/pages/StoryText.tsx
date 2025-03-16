import React, { useEffect, useState } from "react";
import { useConfigStore } from "../store/useConfigStore";
import Nav from "../components/Nav";
import StoryInput from "../components/StoryInput";
import "./Home.css";
import { useDataStore } from "../store/useDataStore";
import { sectionBreakStyle } from "../lib/style";

// a component that shows a small sample of html input and the rendered output
// side by side (flexing to vertical on mobile)
const DemoComponent: React.FC<{
  title: string;
  description: string;
  html: string;
  defaultOpen?: boolean;
}> = ({ title, description, html, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="demo-component">
      <h4 className="demo-title" onClick={() => setIsOpen(!isOpen)}>
        <span className="demo-toggle">{isOpen ? "▼" : "▶"}</span>
        {title}
      </h4>
      {isOpen && (
        <>
          <p
            className="demo-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <div className="demo-content">
            <div className="demo-input">
              <pre>{html}</pre>
            </div>
            <div
              className="demo-output userstuff"
              dangerouslySetInnerHTML={{ __html: html }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

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
  const [isHintBoxOpen, setIsHintBoxOpen] = useState(false);
  const { workskin, toggleWorkSkin } = useConfigStore();
  const {
    title,
    author,
    summary,
    notes,
    endNotes,
    chapterTitle,
    chapterNumber,
    storyData,
    customSectionBreak,
    customSectionBreakStyle,
  } = useDataStore();

  const notesSelectors = [
    "#main",
    "#workskin",
    ".chapter",
    "div.preface",
    "blockquote.userstuff",
  ];

  const chapterSelectors = ["#main", "#workskin", ".chapter", ".userstuff"];

  const userContentDoc = (content: string, wrapSelectors: string[]) => {
    const styles =
      "margin:0;padding:0;min-height:0;border:0 none;width:100%;box-sizing:border-box;";
    const blockquoteStyles = "margin:0 0.643em;width:auto;";
    const tags = wrapSelectors.map((selector: string): string[] => {
      // from the selector, find the tag name (div if none); add any classes
      // from the selector, and add any ids. selectors are always in the order
      // tag.class.class#id
      let tag = "div";
      let id = "";
      let classes: string[] = [];
      if (selector.includes("#")) {
        const idSplit = selector.split("#", 2);
        id = idSplit[1];
        selector = idSplit[0];
      }
      if (id === "workskin") {
        id = workskin ? `workskin` : `noworkskin`;
      }
      if (selector.length === 0) {
        return [`<div id="${id}" style="${styles}">`, "</div>"];
      }
      if (!selector.startsWith(".")) {
        const tagSplit = selector.split(".", 2);
        tag = tagSplit[0];
        selector = tagSplit.length > 1 ? "." + tagSplit[1] : "";
      }
      if (selector.length === 0) {
        return [
          `<${tag} ${id ? `id="${id}" ` : ""}style="${styles}${
            tag === "blockquote" ? blockquoteStyles : ""
          }">`,
          `</${tag}>`,
        ];
      }
      if (selector.startsWith(".")) {
        classes = selector.slice(1).split(".");
      }
      return [
        `<${tag} ${classes.length > 0 ? `class="${classes.join(" ")}" ` : ""}${
          id ? `id="${id}" ` : ""
        }style="${styles}${tag === "blockquote" ? blockquoteStyles : ""}">`,
        `</${tag}>`,
      ];
    });

    return `
<!DOCTYPE html>
<html style="box-sizing:border-box;">
<head>
  <style>
    ${sectionBreakStyle(customSectionBreak, customSectionBreakStyle)}
  </style>
  <link rel="stylesheet" href="${
    import.meta.env.BASE_URL
  }styles/InstagramDM.css">
  <link rel="stylesheet" href="${
    import.meta.env.BASE_URL
  }styles/IPhoneMessages.css">
  <link rel="stylesheet" href="${import.meta.env.BASE_URL}styles/Twitter.css">
  <link rel="stylesheet" href="${import.meta.env.BASE_URL}styles/News.css">
  <link rel="stylesheet" href="${import.meta.env.BASE_URL}styles/Basic.css">
  <link rel="stylesheet" href="${import.meta.env.BASE_URL}styles/AO3.css">
</head>
<body style="margin:-1px 0;box-sizing:border-box;">
${tags.map((tag) => tag[0]).join("")}${content}${tags
      .map((tag) => tag[1])
      .join("")}
</body>
</html>
`;
  };

  return (
    <div className="home">
      <link
        rel="stylesheet"
        href={import.meta.env.BASE_URL + `styles/AO3.css`}
      />
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
            <div className="collapsible-section">
              <button
                className="collapsible-toggle"
                onClick={() => setIsHintBoxOpen(!isHintBoxOpen)}
              >
                {isHintBoxOpen ? "▼" : "▶"} additional styles
              </button>
              {isHintBoxOpen && (
                <div className="collapsible-fields">
                  <p className="field-group-description">
                    add additional styles to the story by wrapping the text in
                    the following tags:
                  </p>
                  <DemoComponent
                    title="quoted news article"
                    description="newspaper clipping, web article, etc."
                    defaultOpen={true}
                    html={`<blockquote class="fakenews">
  <h5>Headline</h5>
  <h6>Subheadline</h6>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Morbi metus nisl, maximus sit amet quam non, ullamcorper
    sollicitudin ex. Sed bibendum ut diam sit amet varius.
    Fusce dolor eros, ultrices sed leo eget, porta semper
    magna. In consequat commodo ex quis elementum. Donec
    vulputate at risus gravida ornare. Pellentesque accumsan
    in tellus et gravida. Pellentesque vestibulum fringilla
    placerat. Sed nunc nisi, euismod at gravida eget, finibus
    at ligula. Proin porttitor est et lectus hendrerit
    laoreet. Nulla maximus, urna sed hendrerit mattis, risus
    nunc feugiat turpis, id feugiat mauris justo eget nibh.
    Quisque id fermentum erat. Ut eu finibus sem, sed
    bibendum ante. Donec gravida enim et tincidunt interdum.
    Maecenas vel tincidunt metus.
  </p>
  <h6>Second subheadline</h6>
  <p>Article body</p>
</blockquote>`}
                  />
                  <DemoComponent
                    title="quoted news article (serif font)"
                    description="fancier newspaper clipping"
                    html={`<blockquote class="fakenews times">
  <h5>Headline</h5>
  <h6>Subheadline</h6>
  <p>
    Phasellus gravida in massa in finibus. Donec at dignissim
    lacus. Aenean nisi lacus, convallis quis lorem in,
    volutpat efficitur odio. Proin consequat congue placerat.
    Morbi ultrices libero ut dui sodales facilisis. Sed sed
    justo ac nibh cursus scelerisque a laoreet nisi. Aliquam
    aliquam a est et aliquam. Integer augue ligula, sagittis
    at lorem quis, tempor malesuada metus. Aliquam sodales
    sollicitudin nunc, a laoreet justo efficitur vel. In id
    convallis ipsum, a feugiat orci. Etiam hendrerit tempus
    nunc, ac accumsan ex. Aliquam et sem eu quam molestie
    sodales. Phasellus eu tellus id quam egestas vehicula vel
    nec nunc. Duis ante tortor, laoreet in ligula quis,
    euismod laoreet orci. Maecenas quam est, blandit a
    vestibulum sit amet, facilisis eget dui. Quisque
    consectetur nibh ut nunc blandit pulvinar.
  </p>
  <h6>Second subheadline</h6>
  <p>Article body</p>
</blockquote>`}
                  />
                  <DemoComponent
                    title="quoted news article (monospace font)"
                    description="looks kind of like teletype output. maybe transcripts of a tv show or something."
                    html={`<blockquote class="fakenews mono">
  <h5>Headline</h5>
  <h6>Subheadline</h6>
  <p>
    Ut pretium massa sit amet nisl lacinia aliquet. Aenean
    auctor finibus luctus. Vestibulum a tellus at turpis
    tempor convallis. Etiam non egestas quam. Curabitur
    tincidunt magna id diam pulvinar, eu mollis odio
    hendrerit. Fusce laoreet risus erat, ut vestibulum diam
    egestas vel. Pellentesque tellus tellus, fermentum at
    hendrerit in, malesuada in ligula. Donec faucibus sem
    dapibus lacus pretium auctor.
  </p>
  <h6>Second subheadline</h6>
  <p>Article body</p>
</blockquote>`}
                  />
                  <DemoComponent
                    title="newspaper tables"
                    description={`for things like sports scores or stock prices (i don't know what kind of
stories people like. intense trading floor dramas?). spaces are mostly preserved here, so you can use them to
align the columns (but keep in mind tags won't take up space!). if the lines are too long they'll scroll
horizontally instead of wrapping. if you want a completely blank line, you can use either
<code>&lt;br&gt;</code> or <code>&amp;nbsp;</code> on the line. you can also use
<a href="https://en.wikipedia.org/wiki/Box-drawing_characters" target="_blank">box-drawing characters</a>
to make the table look nice.`}
                    defaultOpen={true}
                    html={`<pre class="fakenews">
<b>Central Division Standings</b>
<i>March 15, 2025</i>
<br>
 Team       │ GP │ W  │ L  │ OTL │ <b>Pts</b> │ GF  │ GA  │ Diff │ L10   │ Strk
 ───────────┼────┼────┼────┼─────┼─────┼─────┼─────┼──────┼───────┼──────
 Jets       │ 67 │ 46 │ 17 │   4 │  <b>96</b> │ 234 │ 154 │   80 │ 6-3-1 │ W2
 Stars      │ 65 │ 42 │ 21 │   2 │  <b>86</b> │ 222 │ 170 │   52 │ 7-3-0 │ L1
 Avalanche  │ 67 │ 40 │ 24 │   3 │  <b>83</b> │ 224 │ 194 │   30 │ 7-2-1 │ W1
 Wild       │ 67 │ 37 │ 25 │   5 │  <b>79</b> │ 184 │ 194 │  -10 │ 3-6-1 │ L2
 Blues      │ 67 │ 32 │ 28 │   7 │  <b>71</b> │ 195 │ 200 │   -5 │ 7-2-1 │ W1
 Utah       │ 66 │ 29 │ 26 │  11 │  <b>69</b> │ 187 │ 197 │  -10 │ 5-3-2 │ L1
 Predators  │ 66 │ 25 │ 33 │   8 │  <b>58</b> │ 171 │ 214 │  -43 │ 5-4-1 │ L2
 Blackhawks │ 67 │ 20 │ 38 │   9 │  <b>49</b> │ 180 │ 231 │  -51 │ 3-5-2 │ L3

&nbsp;
<u>More results...</u>
</pre>`}
                  />
                  <DemoComponent
                    title="dateline heading"
                    description="like a kind of movie heading that shows the date and time of the story."
                    defaultOpen={true}
                    html={`<div class="dateline">
  <h4>San Francisco International Airport</h4>
  <p><i>16 hours earlier</i></p>
</div>`}
                  />
                  <DemoComponent
                    title="dateline heading (serif font)"
                    description="a dateline heading with a serif font. gives it a more newsy feel."
                    html={`<div class="dateline times">
  <h4>Board Room</h4>
  <p>Nabisco Headquarters<br>
    <i>March 16, 2025</i>
  </p>
</div>`}
                  />
                  <DemoComponent
                    title="dateline heading (monospace font)"
                    description="a dateline heading with a monospace font. for spy movies or typewriter styles."
                    html={`<div class="dateline mono">
  <h4>CIA Headquarters</h4>
  <p><u>Langley, Virginia</u><br>
    <i>10:00 AM EST</i>
  </p>
</div>`}
                  />
                </div>
              )}
            </div>
            {storyData ? (
              <>
                <div className="preface group">
                  <h2 className="title heading">{title || "story title"}</h2>
                  <h3 className="byline heading">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      {author || "author"}
                    </a>
                  </h3>
                </div>
                <div id="chapters">
                  <div className="chapter">
                    <div className="chapter preface group">
                      <h3 className="title">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          Chapter {chapterNumber || 1}
                        </a>
                        : {chapterTitle || "chapter title"}
                      </h3>

                      {summary && (
                        <div id="summary" className="summary module">
                          <h3 className="heading">Summary:</h3>
                          <iframe
                            className="notes-frame"
                            ref={(iframe) => {
                              if (iframe) {
                                const resizeObserver = new ResizeObserver(
                                  () => {
                                    iframe.style.height =
                                      iframe.contentWindow?.document.body
                                        .scrollHeight + "px";
                                  }
                                );
                                iframe.addEventListener("load", () => {
                                  resizeObserver.observe(
                                    iframe.contentWindow?.document
                                      .documentElement as Element
                                  );
                                });
                              }
                            }}
                            sandbox="allow-same-origin"
                            srcDoc={userContentDoc(summary, notesSelectors)}
                            title="Summary content"
                          />
                        </div>
                      )}

                      {(notes || endNotes) && (
                        <div id="notes" className="notes module">
                          <h3 className="heading">Notes:</h3>
                          {notes && (
                            <iframe
                              className="notes-frame"
                              ref={(iframe) => {
                                if (iframe) {
                                  const resizeObserver = new ResizeObserver(
                                    () => {
                                      iframe.style.height =
                                        iframe.contentWindow?.document.body
                                          .scrollHeight + "px";
                                    }
                                  );
                                  iframe.addEventListener("load", () => {
                                    resizeObserver.observe(
                                      iframe.contentWindow?.document
                                        .documentElement as Element
                                    );
                                  });
                                }
                              }}
                              sandbox="allow-same-origin"
                              srcDoc={userContentDoc(notes, notesSelectors)}
                              title="Notes content"
                            />
                          )}
                          {endNotes && (
                            <p>
                              (See the end of the chapter for{" "}
                              <a
                                href="#endnotes"
                                onClick={(e) => {
                                  e.preventDefault();
                                  document
                                    .getElementById("endnotes")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                {notes && "more "}notes
                              </a>
                              .)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <iframe
                      className="chapter-frame"
                      ref={(iframe) => {
                        if (iframe) {
                          const resizeObserver = new ResizeObserver(() => {
                            iframe.style.height =
                              iframe.contentWindow?.document.body.scrollHeight +
                              "px";
                          });
                          iframe.addEventListener("load", () => {
                            resizeObserver.observe(
                              iframe.contentWindow?.document
                                .documentElement as Element
                            );
                          });
                        }
                      }}
                      sandbox="allow-same-origin"
                      srcDoc={userContentDoc(storyData, chapterSelectors)}
                      title="Story content"
                    />
                    {endNotes && (
                      <div className="chapter preface group">
                        <div id="endnotes" className="endnotes module">
                          <h3 className="heading">Notes:</h3>
                          <iframe
                            className="notes-frame"
                            ref={(iframe) => {
                              if (iframe) {
                                const resizeObserver = new ResizeObserver(
                                  () => {
                                    iframe.style.height =
                                      iframe.contentWindow?.document.body
                                        .scrollHeight + "px";
                                  }
                                );
                                iframe.addEventListener("load", () => {
                                  resizeObserver.observe(
                                    iframe.contentWindow?.document
                                      .documentElement as Element
                                  );
                                });
                              }
                            }}
                            sandbox="allow-same-origin"
                            srcDoc={userContentDoc(endNotes, notesSelectors)}
                            title="Notes content"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p>add some text to the input to see a preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryText;
