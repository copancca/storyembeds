import React, { useEffect } from "react";
import Viewer from "../components/Viewer";
import Controls from "../components/Controls";
import PreviewLayout from "../layouts/Preview";
import { copyThreadHTML } from "../lib/clip";
import { newDateOrThrow } from "../lib/parsers";
import { useConfigStore } from "../store/useConfigStore";
import { FocusTweet, Reply } from "../generated/Twitter";
import { User, Tweet, ThreadBlock, TwitterData } from "../types/Twitter";

const example = `{
  "users": [
    {
      "handle": "aliceontwt",
      "name": "alice",
      "pfp": "https://i.imgur.com/yourimage.png"
    },
    {
      "handle": "bobdoesstuff",
      "name": "bob",
      "pfp": "https://i.imgur.com/anotherimage.png"
    }
  ],
  "threadblocks": [
    [
      {
        "handle": "aliceontwt",
        "timestamp": "2023-10-01T12:00:00Z",
        "text": "why did i write this code?",
        "likes": 10,
        "retweets": 2,
        "quotes": 1
      },
      {
        "handle": "bobdoesstuff",
        "timestamp": "2023-10-01T12:05:00Z",
        "text": "i ask myself that too \\n it was a dark time in my life",
        "likes": 5545,
        "retweets": 123,
        "quotes": 45,
        "quoted": {
          "handle": "aliceontwt",
          "timestamp": "2023-10-01T12:00:00Z",
          "text": "why did i write this code?"
        },
        "replies": [
          {
            "handle": "aliceontwt",
            "timestamp": "2023-10-01T12:10:00Z",
            "text": "what is life @bobdoesstuff",
            "likes": 5,
            "retweets": 1,
            "quotes": 1
          },
          {
            "handle": "bobdoesstuff",
            "timestamp": "2023-10-01T12:20:00Z",
            "text": "alice no #dontdoit",
            "likes": 5,
            "retweets": 1,
            "quotes": 0,
            "replyto": "aliceontwt"
          }
        ]
      }
    ]
  ]
}`;

function validateUsers(importedUsers: any[]): importedUsers is User[] {
  for (let user of importedUsers) {
    if (!user.handle) {
      throw new Error("handle required");
    } else if (typeof user.handle !== "string") {
      throw new Error("handle must be a string");
    }
    if (!user.name) {
      throw new Error("username required");
    } else if (typeof user.name !== "string") {
      throw new Error("username must be a string");
    }
    if (user.pfp && typeof user.pfp !== "string") {
      throw new Error("pfp must be a string");
    }
    if (user.handle.startsWith("@")) {
      user.handle = user.handle.slice(1);
    }
  }
  return true;
}

function parser(rawConfig: string): TwitterData {
  const data = JSON.parse(rawConfig);
  if (!data || typeof data !== "object") {
    throw new Error("invalid thread json");
  }
  const { users: importedUsers, threadblocks: tbs } = data;

  if (!Array.isArray(importedUsers) || !Array.isArray(tbs)) {
    throw new Error(
      `both "users" and "threadblocks" must be present and arrays`
    );
  }

  for (let tb of tbs) {
    if (!Array.isArray(tb)) {
      throw new Error("threadblocks must be arrays of tweets");
    }
  }

  if (!validateUsers(importedUsers)) {
    throw new Error("invalid users list");
  }

  const users = importedUsers.reduce((acc, user) => {
    acc[user.handle] = user;
    return acc;
  }, {} as Record<string, User>);

  const getUserOrFail = (handle: string): User => {
    const user = users[handle];
    if (!user) {
      throw new Error(`user ${handle} not found`);
    }
    return user;
  };

  const blocks = tbs.map((tb: any): ThreadBlock => {
    return {
      Tweets: tb.map((tweet: any): Tweet => {
        try {
          const processedTweet = {
            ...tweet,
            user: getUserOrFail(tweet.handle),
            replyto: tweet.parent
              ? getUserOrFail(tweet.parent.handle)
              : tweet.replyto
              ? getUserOrFail(tweet.replyto)
              : null,
            replies: tweet.replies
              ? tweet.replies.map((r: any) => ({
                  ...r,
                  user: getUserOrFail(r.handle),
                  replyto: r.replyto
                    ? getUserOrFail(r.replyto)
                    : getUserOrFail(tweet.handle),
                  timestamp: newDateOrThrow(r.timestamp),
                }))
              : [],
            timestamp: newDateOrThrow(tweet.timestamp),
          };
          if (tweet.quoted) {
            processedTweet.quoted = {
              ...tweet.quoted,
              user: getUserOrFail(tweet.quoted.handle),
              timestamp: newDateOrThrow(tweet.quoted.timestamp),
            };
          }
          if (tweet.parent) {
            processedTweet.parent = {
              ...tweet.parent,
              user: getUserOrFail(tweet.parent.handle),
              replyto: tweet.parent.replyto
                ? getUserOrFail(tweet.parent.replyto)
                : null,
              timestamp: newDateOrThrow(tweet.parent.timestamp),
            };
          }
          return processedTweet;
        } catch (err) {
          const message = err instanceof Error ? err.message : "unknown error";
          throw new Error(
            `error processing tweet ${JSON.stringify(tweet)}: ${message}`
          );
        }
      }),
    };
  });
  return { Users: users, ThreadBlocks: blocks };
}

const instruction = (
  <React.Fragment>
    <p>paste in JSON data to generate a thread.</p>
    <p>
      the JSON data should be an object with two properties: <code>users</code>{" "}
      and <code>threadblocks</code>.
    </p>
    <p>
      users is a list of users (each with a <code>handle</code>,{" "}
      <code>name</code> (display name), and <code>pfp</code> (profile pic URL)).
      the user list stores the profile pictures and names of the users in the
      threads so if an image breaks you can fix it once there and regenerate.
    </p>
    <p>
      threadblocks is a list of lists of tweets. each thread block generates its
      own html to be copied at once.
    </p>
    <p>
      a tweet has a <code>handle</code> that references a user in the users
      list, a <code>timestamp</code> entered in any format that works in your
      browser, and <code>text</code>.
    </p>
    <p>
      text can have newlines entered as <code>\n</code>, and @user tags and
      #hashtags will be highlighted.
    </p>
    <p>
      tweets can also have a <code>parent</code> (to show one previous level of
      reply while focusing the reply), a <code>quoted</code> tweet (you can copy
      it from the tweet it's quoting), and <code>replies</code> as a list of
      tweets in reply.
    </p>
    <p>
      tweets have <code>retweets</code>, <code>likes</code>, and{" "}
      <code>quotes</code> as counts. counts will automatically be formatted to
      have K/M suffixes. "quotes" count as 'quote tweets' on the main focus and
      "replies" on parents/replies. sorry for the confusion.
    </p>
    <p>
      the <code>replyto</code> field will indicate who the tweet is replying to.
      if it's not included in a reply, it will be set to the focused tweet's
      handle.
    </p>
    <p>
      if you make a tweet with a user that doesn't exist, it will error. other
      than that the error checking is not that great because if there's one
      thing even hyperfixation won't get me to do it's error handling.
    </p>
  </React.Fragment>
);

const renderTweets = (): React.ReactNode => {
  const { twitterData, setOutput } = useConfigStore();
  return twitterData?.ThreadBlocks.map((tb, i) => (
    <React.Fragment key={i}>
      <h3>thread block {i + 1}</h3>
      <div className="block-content userstuff" id={`thread-block-${i}`}>
        {tb.Tweets.map((t, j) => (
          <React.Fragment key={j}>
            <div className="twt">
              <FocusTweet tweet={t} />
              {t.replies?.map((r, k) => (
                <Reply tweet={r} key={k} />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
      <button className="copy-btn" onClick={() => copyThreadHTML(i, setOutput)}>
        Copy this block HTML
      </button>
      <hr />
    </React.Fragment>
  ));
};

const Twitter: React.FC = () => {
  const { setTwitterData } = useConfigStore();
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = import.meta.env.BASE_URL + "styles/Twitter.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // clean up on unmount
    };
  }, []);
  return (
    <PreviewLayout
      controls={
        <Controls
          buttonText="make some tweets"
          titleText="twitter threads"
          example={example}
          instructions={instruction}
          parser={(rawConfig: string) => {
            const parsed = parser(rawConfig);
            setTwitterData(parsed);
          }}
        />
      }
      viewer={<Viewer render={renderTweets} />}
    />
  );
};

export default Twitter;
