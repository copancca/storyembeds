import React from "react";
import {
  formatText,
  formatInstagramTimestamp,
  longSince,
} from "../lib/formatters";
import { MessageBlock } from "../types/Instagram";

interface PhoneProps {
  phone: MessageBlock;
  now?: Date;
}

export const PhoneDMs: React.FC<PhoneProps> = ({ phone, now: globalNow }) => {
  if (!phone) return null;
  const now = phone.now ? phone.now : globalNow;
  return (
    <div className="insta">
      <hr className="sendbox" />
      <div className="header">
        <div className="back" />
        <div className="profile">
          <p className="pfp">
            {phone.contact.pfp ? (
              <img
                height="48"
                width="48"
                src={phone.contact.pfp}
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
            {phone.contact.name}
          </h5>
        </div>
        <div className="video">
          <div className="cambod" />
          <div className="camlens" />
        </div>
      </div>
      <div className="body">
        {phone.messages.map((msg, i) => {
          const emojiOnly = msg.text
            .trim()
            .match(
              /^(?:\p{Emoji}(?:\p{Emoji_Modifier}|️|\uFE0F|\u200D[\p{Emoji}])+|\p{Emoji_Presentation}|\p{Extended_Pictographic})+$/u
            );
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
                  (emojiOnly ? " emoji" : "") +
                  (msg.tapback ? " tapped" : "")
                }
              >
                <span className="desc">
                  {msg.me ? "Me" : phone.contact.name}:{" "}
                </span>
                {formatText(msg.text)}
                {msg.tapback ? (
                  <span className="tapback">
                    {" "}
                    <span className="desc">Tapback:</span>
                    {msg.tapback}
                  </span>
                ) : null}
                {!msg.me &&
                (i === phone.messages.length - 1 ||
                  longSince(phone.messages[i + 1], msg) ||
                  phone.messages[i + 1].me ||
                  phone.messages[i + 1].tapback) ? (
                  phone.contact.pfp ? (
                    <img
                      className="pfp"
                      src={phone.contact.pfp}
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
