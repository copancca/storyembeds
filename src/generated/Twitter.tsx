import React from "react";
import {
  formatText,
  formatTwitterCount,
  formatTwitterShortTimestamp,
  formatTwitterTimestamp,
  tagHandles,
} from "../lib/formatters";
import { Tweet } from "../types/Twitter";

interface ThreadProps {
  tweet: Tweet;
}

// parent preview
export const Parent: React.FC<ThreadProps> = ({ tweet }) => {
  if (!tweet) return null;
  return (
    <>
      <div className="parentbox">
        <div className="icon-replycontainer">
          <p>
            <img
              className="pfp"
              width="48"
              height="48"
              src={tweet.user.pfp}
              alt={tweet.user.name}
            />
          </p>
        </div>
        <div className="replycontainer">
          <p>
            <span className="name">{tweet.user.name}</span>{" "}
            <span className="handle">
              @{tweet.user.handle} ∙{" "}
              {formatTwitterShortTimestamp(tweet.timestamp)}
            </span>
            {tweet.replyto !== null ? (
              <>
                <br />
                <span className="handle">Replying to</span>{" "}
                <span className="hl">@{tweet.replyto?.handle}</span>
              </>
            ) : null}
          </p>
          <div className="replycontent">
            <p>{formatText(tweet.text, tagHandles)}</p>
          </div>
          <div className="stat2">
            <p>
              <span className="social">
                <span className="qt"></span>
                {formatTwitterCount(
                  tweet.quotes && tweet.quotes > 0 ? tweet.quotes : 1
                )}
                <span className="desc">
                  {" "}
                  {tweet.quotes && tweet.quotes > 1 ? "Replies" : "Reply"}{" "}
                </span>
              </span>
              <span className="social">
                <span className="rt"></span>
                {formatTwitterCount(tweet.retweets)}
                <span className="desc">
                  {" "}
                  {tweet.retweets === 1 ? "Retweet" : "Retweets"}{" "}
                </span>
              </span>
              <span className="social">
                <span className="ht"></span>
                {formatTwitterCount(tweet.likes)}
                <span className="desc">
                  {" "}
                  {tweet.likes === 1 ? "Like" : "Likes"}{" "}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
      <hr className="sep-reply" />
    </>
  );
};

// reply preview
export const Reply: React.FC<ThreadProps> = ({ tweet }) => {
  if (!tweet) return null;
  return (
    <>
      <hr className="sep-reply" />
      <div className="replybox">
        <div className="icon-replycontainer">
          <p>
            <img
              className="pfp"
              height="48"
              width="48"
              src={tweet.user.pfp}
              alt={tweet.user.name}
            />
          </p>
        </div>
        <div className="replycontainer">
          <p>
            <span className="name">{tweet.user.name}</span>{" "}
            <span className="handle">
              @{tweet.user.handle} ∙{" "}
              {formatTwitterShortTimestamp(tweet.timestamp)}
            </span>
            <br />
            <span className="handle">Replying to</span>{" "}
            <span className="hl">@{tweet.replyto?.handle}</span>
          </p>
          <div className="replycontent">
            <p>{formatText(tweet.text, tagHandles)}</p>
          </div>
          <div className="stat2">
            <p>
              <span className="social">
                <span className="qt"></span>
                {formatTwitterCount(tweet.quotes)}
                <span className="desc">
                  {" "}
                  {tweet.quotes === 1 ? "Reply" : "Replies"}{" "}
                </span>
              </span>
              <span className="social">
                <span className="rt"></span>
                {formatTwitterCount(tweet.retweets)}
                <span className="desc">
                  {" "}
                  {tweet.retweets === 1 ? "Retweet" : "Retweets"}{" "}
                </span>
              </span>
              <span className="social">
                <span className="ht"></span>
                {formatTwitterCount(tweet.likes)}
                <span className="desc">
                  {" "}
                  {tweet.likes === 1 ? "Like" : "Likes"}{" "}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// focus tweet preview
export const FocusTweet: React.FC<ThreadProps> = ({ tweet }) => {
  if (!tweet) return null;
  const replyTo = tweet.parent
    ? tweet.parent.user.handle
    : tweet.replyto
    ? tweet.replyto.handle
    : null;
  return (
    <>
      <h5 className="desc">Twitter thread</h5>
      {tweet.parent ? <Parent tweet={tweet.parent} /> : null}
      <div className={tweet.parent ? "header-parent" : "header"}>
        <div className="icon-container">
          <p>
            <img
              className="pfp"
              height="48"
              width="48"
              src={tweet.user.pfp}
              alt={tweet.user.name}
            />
          </p>
        </div>
        <div className="twt-id">
          <p>
            <span className="name">{tweet.user.name}</span>
            <br />
            <span className="handle">@{tweet.user.handle}</span>
            {replyTo ? (
              <>
                <br />
                <span className="handle">Replying to</span>{" "}
                <span className="hl">@{replyTo}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
      <div className={tweet.parent ? "content-parent content" : "content"}>
        <p>{formatText(tweet.text, tagHandles)}</p>
      </div>
      {!tweet.parent && tweet.quoted ? (
        <div className="quotebox">
          <div className="header">
            <div className="icon-container">
              <p>
                <img
                  className="pfp"
                  height="48"
                  width="48"
                  src={tweet.quoted?.user.pfp}
                  alt={tweet.quoted?.user.name}
                />
              </p>
            </div>
            <div className="twt-id">
              <p>
                <span className="name">{tweet.quoted?.user.name}</span>{" "}
                <span className="handle">
                  @{tweet.quoted?.user.handle} ∙{" "}
                  {formatTwitterShortTimestamp(tweet.quoted.timestamp)}
                </span>
              </p>
            </div>
          </div>
          <div className="content-quote">
            <p>{formatText(tweet.quoted.text, tagHandles)}</p>
          </div>
        </div>
      ) : null}
      <div className="timestamp">
        <p>{formatTwitterTimestamp(tweet.timestamp)}</p>
      </div>
      <hr className="sep" />
      <div className="stat1">
        <p>
          <strong>{formatTwitterCount(tweet.retweets)}</strong>{" "}
          {tweet.retweets === 1 ? "Retweet" : "Retweets"} &nbsp;&nbsp;
          <strong>{formatTwitterCount(tweet.quotes)}</strong>{" "}
          {tweet.quotes === 1 ? "Quote Tweet" : "Quote Tweets"} &nbsp;&nbsp;
          <strong>{formatTwitterCount(tweet.likes)}</strong>{" "}
          {tweet.likes === 1 ? "Like" : "Likes"}
        </p>
      </div>
    </>
  );
};
