import React, { useEffect } from "react";
import Viewer from "../components/Viewer";
import Controls from "../components/Controls";
import PreviewLayout from "../layouts/Preview";
import { copyThreadHTML } from "../lib/clip";
import { newDateOrThrow, newOptionalDate } from "../lib/parsers";
import { useConfigStore } from "../store/useConfigStore";
import { PhoneDMs } from "../generated/Instagram";
import {
  InstaAccount,
  InstaData,
  Message,
  MessageBlock,
} from "../types/Instagram";

const example = `{
  "now": "2023-10-01T13:00:00Z",
  "owneraccount": "charlieisgreat",
  "accounts": [
    {
      "name": "randomuser",
      "pfp": "https://avatars.githubusercontent.com/u/5594598?v=4"
    },
    {
      "name": "otheruser"
    }
  ],
  "messageblocks": [
    {
      "account": "randomuser",
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
      "account": "otheruser",
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

  const { now: nowStr, owneraccount, accounts, messageblocks } = data;

  if (!Array.isArray(messageblocks)) {
    throw new Error(`"messageblocks" must be present and an array`);
  }

  if (!Array.isArray(accounts)) {
    throw new Error(`"accounts" must be present and an array`);
  }

  const accountList = accounts.reduce(
    (
      acc: Record<string, InstaAccount>,
      acct: any
    ): Record<string, InstaAccount> => {
      if (typeof acct !== "object") {
        throw new Error(`"account" must be an object`);
      }
      const { name, pfp } = acct;
      if (!name) {
        throw new Error(`"name" required for account`);
      } else if (typeof name !== "string") {
        throw new Error(`"name" must be a string`);
      }
      if (pfp !== undefined && typeof pfp !== "string") {
        throw new Error(`"pfp" must be a string if present`);
      }
      acc[name] = { name, pfp };
      return acc;
    },
    {} as Record<string, InstaAccount>
  );

  if (!(owneraccount === undefined || typeof owneraccount === "string")) {
    throw new Error(`"owneraccount" must be a string if present`);
  }

  const now = newOptionalDate(nowStr);

  return {
    now,
    owner: owneraccount,
    accounts: accountList,
    messageBlocks: messageblocks.map((mb): MessageBlock => {
      const { account, messages } = mb;
      if (!Array.isArray(messages)) {
        throw new Error(`"messages" must be present and an array`);
      }
      if (!account || typeof account !== "string") {
        throw new Error(`"account" must be present and a string`);
      }
      if (!accountList[account]) {
        throw new Error(`"${account}" not found in accounts`);
      }
      return {
        account,
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
      the JSON data is an object with at least two properties:{" "}
      <code>accounts</code> and <code>messageblocks</code>.
    </p>
    <p>
      in additionto the two required properties, you can also set{" "}
      <code>now</code> and <code>owneraccount</code>. <code>now</code> is the
      current time, which is used to format timestamps if they're set on
      messages. <code>owneraccount</code> is the name of the account that owns
      the phone, and is used only to display the name of the other user when the
      work skin is disabled. if it is not set, the description text will say
      "Me".
    </p>
    <p>
      accounts is a list of Instagram accounts, each with a <code>name</code>{" "}
      and an optional <code>pfp</code> profile picture. if you don't set a pfp,
      the profile picture will be a placeholder.
    </p>
    <p>
      messageblocks is a list of message blocks, each of which must have an{" "}
      <code>account</code> which is the name of the account that the messages
      are from. each message block generates its own html to be copied.
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
        <PhoneDMs
          account={instaData.accounts[mb.account]}
          owner={instaData.owner}
          phone={mb}
          now={now}
        />
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
    link.href = import.meta.env.BASE_URL + "styles/InstagramDM.css";
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
