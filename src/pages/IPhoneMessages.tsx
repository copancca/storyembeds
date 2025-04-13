import React, { useEffect } from "react";
import Viewer from "../components/Viewer";
import Controls from "../components/Controls";
import PreviewLayout from "../layouts/Preview";
import { copyThreadHTML } from "../lib/clip";
import { newDateOrThrow, newOptionalDate } from "../lib/parsers";
import { useConfigStore } from "../store/useConfigStore";
import { PhoneMessages } from "../generated/IPhone";
import { Contact, PhoneData, Message, MessageBlock } from "../types/Phone";

const example = `{
  "now": "2023-10-01T13:05:00Z",
  "owner": "Charlie",
  "contacts": [
    {
      "name": "Alice",
      "pfp": "https://i.imgur.com/yourimage.png"
    },
    {
      "name": "Bob",
      "display": "Bob ❤️❤️❤️"
    }
  ],
  "messageblocks": [
    {
      "name": "Alice",
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
      "name": "Bob",
      "iphone": false,
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

function parser(rawConfig: string): PhoneData {
  const data = JSON.parse(rawConfig);
  if (!data || typeof data !== "object") {
    throw new Error("invalid thread json");
  }

  const { now: nowStr, contacts, owner, messageblocks } = data;

  if (!Array.isArray(messageblocks)) {
    throw new Error(`"messageblocks" must be present and an array`);
  }

  if (!(contacts === undefined || Array.isArray(contacts))) {
    throw new Error(`"contacts" must be an array if present`);
  }

  if (!(owner === undefined || typeof owner === "string")) {
    throw new Error(`"owner" must be a string if present`);
  }

  const contactRecord = ((contacts as any[] | undefined) || []).reduce(
    (acc: Record<string, Contact>, acct: any): Record<string, Contact> => {
      if (typeof acct !== "object") {
        throw new Error(`"contact" must be an object`);
      }
      const { name, display, pfp } = acct;
      if (!name) {
        throw new Error(`"name" required for contact`);
      } else if (typeof name !== "string") {
        throw new Error(`"name" must be a string`);
      }
      const displayName = display || name;
      if (typeof displayName !== "string") {
        throw new Error(`"display" must be a string`);
      }
      if (!(pfp === undefined || typeof pfp === "string")) {
        throw new Error(`"pfp" must be a string if present`);
      }
      acc[name] = { name, displayName, pfp };
      return acc;
    },
    {} as Record<string, Contact>
  );

  const now = newOptionalDate(nowStr);

  return {
    now,
    owner,
    contacts: contactRecord,
    messageBlocks: messageblocks.map((mb): MessageBlock => {
      const { name, phonenumber, messages } = mb;
      if (!Array.isArray(messages)) {
        throw new Error(`"messages" must be present and an array`);
      }
      if (!phonenumber && !name) {
        throw new Error(`one of "name" or "phonenumber" must be present`);
      }
      if (phonenumber && typeof phonenumber !== "string") {
        throw new Error(`"phonenumber" must be a string`);
      }
      if (name) {
        if (typeof name !== "string") {
          throw new Error(`"name" must be a string`);
        }
        if (!contactRecord[name]) {
          throw new Error(`"${name}" not found in contacts`);
        }
      }
      return {
        name,
        header: mb.header !== false,
        now: mb.now ? newDateOrThrow(mb.now) : undefined,
        phoneNumber: phonenumber,
        showStatus: mb.showstatus,
        supportsIMessage: mb.iphone !== false,
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
    <p>paste in JSON data to generate a thread.</p>
    <p>
      the JSON data is an object with at least two properties:{" "}
      <code>contacts</code> and <code>messageblocks</code>.
    </p>
    <p>
      in additionto the two required properties, you can also set{" "}
      <code>now</code> and <code>owner</code>. <code>now</code> is the current
      time, which is used to format timestamps if they're set on messages.{" "}
      <code>owner</code> is the name of the person that owns the phone, and is
      used only to display the name of the other user when the work skin is
      disabled. if it is not set, the description text will say "Me".
    </p>
    <p>
      contacts is a list of phone contacts, each with a <code>name</code> and
      optional <code>display</code> display name, which allows you to use a
      simpler name when writing the text (e.g. "Alice" instead of "Alice
      ❤️❤️❤️"). in that case, the description text with no skin will be "Alice".
      it's not required though. <code>pfp</code> is an optional profile picture.
      if you don't set a pfp, the profile picture will be a placeholder.
    </p>
    <p>
      messageblocks is a list of message blocks, each of which must have a{" "}
      <code>name</code> which is the name field of the contact that the messages
      are from. each message block generates its own html to be copied. you can
      optionally set <code>header</code> to <code>false</code> to hide the phone
      header (and show only the messages).
    </p>
    <p>
      a message block will also have a list of <code>messages</code>. each
      message must have a <code>from</code> (either "me", which is the phone's
      user, or "you") and a <code>text</code> field. <code>tapback</code> can be
      set to an emoji to show a tapback. you can also set <code>sent</code> and{" "}
      <code>read</code> timestamps, <code>delivered</code> can be set to{" "}
      <code>false</code> to show a message that failed to send.
    </p>
    <p>
      text can have newlines entered as <code>\n</code>.
    </p>
    <p>
      if you set <code>iphone</code> to <code>false</code>, the messages will be
      green instead of blue. if you set <code>showstatus</code> to{" "}
      <code>true</code>, the status indicators (e.g. delivered/read) will be
      shown.
    </p>
  </React.Fragment>
);

const renderPhones = (): React.ReactNode => {
  const { phoneData, setOutput } = useConfigStore();
  if (!phoneData) {
    return null;
  }
  return phoneData?.messageBlocks.map((mb, i) => {
    const contact = mb.name ? phoneData.contacts[mb.name] : undefined;
    return (
      <React.Fragment key={i}>
        <h3>message block {i + 1}</h3>
        <div className="block-content userstuff" id={`thread-block-${i}`}>
          <PhoneMessages
            owner={phoneData.owner}
            now={phoneData.now}
            contact={contact}
            phone={mb}
          />
        </div>
        <button
          className="copy-btn"
          onClick={() => copyThreadHTML(i, setOutput)}
        >
          Copy this block HTML
        </button>
        <hr />
      </React.Fragment>
    );
  });
};

const IPhoneMessages: React.FC = () => {
  const { setPhoneData } = useConfigStore();
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = import.meta.env.BASE_URL + "styles/IPhoneMessages.css";
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
            setPhoneData(parsed);
          }}
        />
      }
      viewer={<Viewer render={renderPhones} />}
    />
  );
};

export default IPhoneMessages;
