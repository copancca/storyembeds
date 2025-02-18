import React, { useEffect } from "react";
import Viewer from "../components/Viewer";
import Controls from "../components/Controls";
import PreviewLayout from "../layouts/Preview";
import { copyThreadHTML } from "../lib/clip";
import { newDateOrThrow, newOptionalDate } from "../lib/parsers";
import { useConfigStore } from "../store/useConfigStore";
import { PhoneDMs } from "../generated/Instagram";
import { InstaData, Message, MessageBlock } from "../types/Instagram";

const example = `{
  "now": "2023-10-01T13:00:00Z",
  "messageblocks": [
    {
      "contact": {
        "name": "randomuser",
        "pfp": "https://avatars.githubusercontent.com/u/5594598?v=4"
      },
      "messages": [
        {
          "from": "you",
          "text": "Too good for a goodbye?"
        },
        {
          "from": "me",
          "text": "it was the middle of the night."
        },
        {
          "from": "me",
          "text": "more text",
          "tapback": "😂"
        }
      ]
    },
    {
      "contact": {
        "name": "otheruser"
      },
      "now": "2025-02-01 13:00:00",
      "messages": [
        {
          "from": "you",
          "text": "another example, with timestamps",
          "sent": "2025-01-01 12:00:00"
        },
        {
          "from": "you",
          "text": "this message was more recent",
          "sent": "2025-02-01 12:00:00"
        },
        {
          "from": "you",
          "text": "and another not long after",
          "sent": "2025-02-01 12:03:00"
        },
        {
          "from": "you",
          "text": "and another"
        },
        {
          "from": "me",
          "text": "got it"
        },
        {
          "from": "me",
          "text": "🥲🥲"
        }
      ]
    }
  ]
}`;

function parser(rawConfig: string): InstaData {
  const data = JSON.parse(rawConfig);
  if (!data || typeof data !== "object") {
    throw new Error("invalid thread json");
  }

  const { now: nowStr, messageblocks } = data;

  if (!Array.isArray(messageblocks)) {
    throw new Error(`"messageblocks" must be present and an array`);
  }

  const now = newOptionalDate(nowStr);

  return {
    now,
    messageBlocks: messageblocks.map((mb): MessageBlock => {
      const { contact, messages } = mb;
      if (!Array.isArray(messages)) {
        throw new Error(`"messages" must be present and an array`);
      }
      if (!contact) {
        throw new Error(`"contact" must be present`);
      }
      if (contact) {
        if (typeof contact !== "object") {
          throw new Error(`"contact" must be an object`);
        }
        if (!contact.name) {
          throw new Error(`"name" required for contact`);
        } else if (typeof contact.name !== "string") {
          throw new Error(`"name" must be a string`);
        }
        if (contact.pfp && typeof contact.pfp !== "string") {
          throw new Error(`"pfp" must be a string`);
        }
      }
      return {
        contact: contact && {
          name: contact.name,
          pfp: contact.pfp,
        },
        now: mb.now ? newDateOrThrow(mb.now) : undefined,
        messages: mb.messages.map((m: any): Message => {
          if (typeof m !== "object") {
            throw new Error(`"message" must be an object`);
          }
          if (!m.from) {
            throw new Error(`"from" required for message`);
          } else if (typeof m.from !== "string") {
            throw new Error(`"from" must be a string`);
          }
          if (!m.text) {
            throw new Error(`"text" required for message`);
          } else if (typeof m.text !== "string") {
            throw new Error(`"text" must be a string`);
          }
          return {
            me: m.from === "me",
            text: m.text,
            sent: m.sent ? newDateOrThrow(m.sent) : undefined,
            tapback: m.tapback,
          };
        }),
      };
    }),
  };
}

const instruction = (
  <React.Fragment>
    <p>
      paste in JSON data to generate a DM thread. did this because I wanted to
      get that mildly fun gradient in the chat bubbles.
    </p>
    <p>
      the JSON data should be an object with one property:{" "}
      <code>messageblocks</code>. you can optinally set <code>now</code> which
      is used to decide when to break up messages, but it's not super tested.
      each message block generates its own html to be copied.
    </p>
    <p>
      a message block is a list of phone scenes, each of which must have a{" "}
      <code>contact</code> which has a <code>name</code> and an optional{" "}
      <code>pfp</code> profile picture. if you don't set a pfp, the profile
      picture will be a placeholder.
    </p>
    <p>
      a message block will also have a list of <code>messages</code>. each
      message must have a <code>from</code> (either "me", which is the phone's
      user, or "you") and a <code>text</code> field. you can also set a{" "}
      <code>sent</code> timestamp, and a <code>tapback</code> emoji.
    </p>
    <p>
      text can have newlines entered as <code>\n</code>.
    </p>
  </React.Fragment>
);

const renderDMs = (): React.ReactNode => {
  const { instaData, setOutput } = useConfigStore();
  if (!instaData) {
    return null;
  }
  const now = instaData.now;
  return instaData?.messageBlocks.map((mb, i) => (
    <React.Fragment key={i}>
      <h3>message block {i + 1}</h3>
      <div className="block-content userstuff" id={`thread-block-${i}`}>
        <PhoneDMs phone={mb} now={now} />
      </div>
      <button className="copy-btn" onClick={() => copyThreadHTML(i, setOutput)}>
        Copy this block HTML
      </button>
      <hr />
    </React.Fragment>
  ));
};

const InstagramDM: React.FC = () => {
  const { setInstaData } = useConfigStore();
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/InstagramDM.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // clean up on unmount
    };
  }, []);
  return (
    <PreviewLayout
      controls={
        <Controls
          buttonText="make some phones"
          titleText="instagram dm threads"
          example={example}
          instructions={instruction}
          parser={(rawConfig: string) => {
            const parsed = parser(rawConfig);
            setInstaData(parsed);
          }}
        />
      }
      viewer={<Viewer render={renderDMs} />}
    />
  );
};

export default InstagramDM;
