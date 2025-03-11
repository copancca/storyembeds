import React, { useEffect } from "react";
import Viewer from "../components/Viewer";
import StoryInput from "../components/StoryInput";
import PreviewLayout from "../layouts/Preview";
import { useConfigStore } from "../store/useConfigStore";

const StoryText: React.FC = () => {
  const { renderedStory } = useConfigStore();
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
  const renderStory = () => {
    return (
      <div
        className="userstuff"
        dangerouslySetInnerHTML={{ __html: renderedStory }}
      />
    );
  };
  return (
    <PreviewLayout
      controls={<StoryInput buttonText="story it" titleText="gdoc to html" />}
      viewer={<Viewer render={renderStory} />}
    />
  );
};

export default StoryText;
