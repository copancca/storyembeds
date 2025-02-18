import React, { useEffect } from "react";
import Viewer from "../components/Viewer";
import Controls from "../components/Controls";
import PreviewLayout from "../layouts/Preview";
import { copyThreadHTML } from "../lib/clip";
import { newDateOrThrow, newOptionalDate } from "../lib/parsers";
import { useConfigStore } from "../store/useConfigStore";
import { PhoneMessages } from "../generated/IPhone";
import { IPhoneData, Message, MessageBlock } from "../types/IPhone";

const example = `{
  "now": "2023-10-01T13:05:00Z",
  "messageblocks": [
    {
      "contact": {
        "name": "alice",
        "pfp": "https://i.imgur.com/yourimage.png"
      },
      "messages": [
        {
          "from": "me",
          "text": "text message thing"
        },
        {
          "from": "me",
          "text": "❤️"
        },
        {
          "from": "you",
          "text": "👍❤️"
        },
        {
          "from": "you",
          "text": "here's more for you"
        }
      ]
    },
    {
      "contact": {
        "name": "alice",
        "iphone": false
      },
      "showstatus": true,
      "messages": [
        {
          "from": "me",
          "text": "this old thread",
          "sent": "2023-09-01T12:00:00Z",
          "read": "2023-09-01T12:05:00Z"
        },
        {
          "from": "me",
          "text": "text message thing",
          "sent": "2023-10-01T12:00:00Z",
          "read": "2023-10-01T12:05:00Z",
          "tapback": "👍"
        },
        {
          "from": "you",
          "text": "got it",
          "tapback": "❤️"
        },
        {
          "from": "you",
          "text": "here's more for you"
        },
        {
          "from": "me",
          "text": "ok that's great",
          "sent": "2023-10-01T12:00:00Z"
        },
        {
          "from": "me",
          "text": "you still there?",
          "delivered": false
        }
      ]
    }
  ]
}`;

function parser(rawConfig: string): IPhoneData {
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
      const { contact, phonenumber, messages } = mb;
      if (!Array.isArray(messages)) {
        throw new Error(`"messages" must be present and an array`);
      }
      if (!phonenumber && !contact) {
        throw new Error(`either "phonenumber" or "contact" must be present`);
      }
      if (phonenumber && typeof phonenumber !== "string") {
        throw new Error(`"phonenumber" must be a string`);
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
        phoneNumber: mb.phonenumber,
        showStatus: mb.showstatus,
        supportsIMessage: contact?.iphone !== false,
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
            delivered: m.delivered !== false,
            sent: m.sent ? newDateOrThrow(m.sent) : undefined,
            read: m.read ? newDateOrThrow(m.read) : undefined,
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
      paste in JSON data to generate a thread. i had most of this for a separate
      project but figured you might find it useful. get them some new phones,
      etc.
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
      <code>pfp</code> profile picture. if no pfp is set, a placeholder will be
      used. the <code>iphone</code> property can be set to false to make green
      bubbles.
    </p>
    <p>
      a message block will also have a list of <code>messages</code>. each
      message must have a <code>from</code> (either "me", which is the phone's
      user, or "you") and a <code>text</code> field. you can also set{" "}
      <code>sent</code> and <code>read</code> timestamps, and a{" "}
      <code>tapback</code> emoji.
    </p>
    <p>
      text can have newlines entered as <code>\n</code>.
    </p>
  </React.Fragment>
);

const renderPhones = (): React.ReactNode => {
  const { iphoneData, setOutput } = useConfigStore();
  if (!iphoneData) {
    return null;
  }
  const now = iphoneData.now;
  return iphoneData?.messageBlocks.map((mb, i) => (
    <React.Fragment key={i}>
      <h3>message block {i + 1}</h3>
      <div className="block-content userstuff" id={`thread-block-${i}`}>
        <PhoneMessages phone={mb} now={now} />
      </div>
      <button className="copy-btn" onClick={() => copyThreadHTML(i, setOutput)}>
        Copy this block HTML
      </button>
      <hr />
    </React.Fragment>
  ));
};

const IPhoneMessages: React.FC = () => {
  const { setIphoneData } = useConfigStore();
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/IPhoneMessages.css";
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
          titleText="iphone message threads"
          example={example}
          instructions={instruction}
          parser={(rawConfig: string) => {
            const parsed = parser(rawConfig);
            setIphoneData(parsed);
          }}
        />
      }
      viewer={<Viewer render={renderPhones} />}
    />
  );
};

export default IPhoneMessages;
