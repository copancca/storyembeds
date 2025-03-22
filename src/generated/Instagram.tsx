import React from "react";
import {
  emojiOnly,
  formatText,
  formatInstagramTimestamp,
  longSince,
} from "../lib/formatters";
import { InstaAccount, MessageBlock } from "../types/Instagram";

interface PhoneProps {
  phone: MessageBlock;
  account: InstaAccount;
  owner?: string;
  now?: Date;
}

export const PhoneDMs: React.FC<PhoneProps> = ({
  phone,
  account,
  owner,
  now: globalNow,
}) => {
  if (!phone) return null;
  const now = phone.now ? phone.now : globalNow;
  return (
    <div className="insta">
      <div className="sendbox" />
      <div className="header">
        <div className="back" />
        <div className="profile">
          <p className="pfp">
            {account.pfp ? (
              <img
                height="48"
                width="48"
                src={account.pfp}
                alt="profile image"
              />
            ) : (
              <span className="nopfpborder">
                <span className="nopfp" />
              </span>
            )}
          </p>
          <h5 className="name">
            <span className="desc">Instagram DMs from </span>
            {account.name}
          </h5>
        </div>
        <div className="video callicon" />
        <div className="audio callicon" />
      </div>
      <div className="body">
        {phone.messages.map((msg, i) => {
          const showTimestamp =
            msg.sent && (i === 0 || longSince(msg, phone.messages[i - 1]));
          return (
            <React.Fragment key={i}>
              {showTimestamp ? (
                <p className="timestamp">
                  {formatInstagramTimestamp(now, msg.sent)}
                </p>
              ) : null}
              <p
                className={
                  (msg.me ? "me" : "you") +
                  (emojiOnly(msg.text) ? " emoji" : "") +
                  (msg.tapback ? " tapped" : "")
                }
              >
                <span className="desc">
                  {msg.me ? owner || "Me" : account.name}:{" "}
                </span>
                {formatText(msg.text)}
                {msg.tapback ? (
                  <span className="tapback">
                    <span className="desc"> · Tapback:</span> {msg.tapback}
                  </span>
                ) : null}
                {!msg.me &&
                (i === phone.messages.length - 1 ||
                  longSince(phone.messages[i + 1], msg) ||
                  phone.messages[i + 1].me ||
                  phone.messages[i + 1].tapback) ? (
                  account.pfp ? (
                    <img
                      className="pfp"
                      src={account.pfp}
                      height={0}
                      width={0}
                    />
                  ) : (
                    <span className="pfp">
                      <span className="nopfp" />
                    </span>
                  )
                ) : null}
              </p>
            </React.Fragment>
          );
        })}
        <div className="clear" />
      </div>
      <div className="sendbox" />
    </div>
  );
};
