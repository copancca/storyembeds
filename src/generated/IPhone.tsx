import React from "react";
import {
  emojiOnly,
  formatText,
  formatFirstLetter,
  formatIOSReadTimestamp,
  formatIOSTimestamp,
  longSince,
} from "../lib/formatters";
import { Contact, MessageBlock } from "../types/Phone";

interface PhoneProps {
  phone: MessageBlock;
  owner?: string;
  contact?: Contact;
  now?: Date;
}

export const PhoneMessages: React.FC<PhoneProps> = ({
  phone,
  contact,
  owner,
  now: globalNow,
}) => {
  if (!phone) return null;
  const now = phone.now ? phone.now : globalNow;
  let lastRead = null;
  let lastDelivered = null;
  if (phone.showStatus) {
    for (let i = phone.messages.length - 1; i >= 0; i--) {
      if (phone.messages[i].me) {
        if (lastRead === null && phone.messages[i].read) {
          lastRead = i;
          break;
        }
        if (lastDelivered === null && phone.messages[i].delivered !== false) {
          lastDelivered = i;
        }
      }
    }
    if (lastRead !== null) {
      if (lastDelivered && lastDelivered <= lastRead) {
        lastDelivered = null;
      }
    }
  }
  const displayName = contact?.displayName || phone.phoneNumber;
  const name = contact?.name || phone.phoneNumber;
  return (
    <div className="phone">
      <div className="sendbox" />
      <div className="header">
        <div className="back" />
        {phone.supportsIMessage ? (
          <div className="facetime">
            <div className="cambod" />
            <div className="camlens" />
          </div>
        ) : null}
        <div className="profile">
          <p className="pfp">
            {contact?.pfp ? (
              <img
                className="pfp"
                src={contact.pfp}
                alt="profile image"
                width="48"
                height="48"
              />
            ) : contact && formatFirstLetter(contact.displayName) ? (
              <span>{formatFirstLetter(contact.displayName)}</span>
            ) : (
              <span className="nopfp" />
            )}
          </p>
          <h5 className="name">
            <span className="desc">iPhone messages from </span>
            {displayName}
          </h5>
        </div>
      </div>
      <div className={phone.supportsIMessage === false ? "body green" : "body"}>
        {phone.messages.map((msg, i) => {
          const readAt = formatIOSReadTimestamp(now, msg.read);
          return (
            <React.Fragment key={i}>
              {(i > 0 && longSince(msg, phone.messages[i - 1])) ||
              (i == 0 && msg.sent) ? (
                <p className="timestamp">{formatIOSTimestamp(now, msg.sent)}</p>
              ) : null}
              <p
                className={
                  (msg.me ? "me" : "you") +
                  (emojiOnly(msg.text) ? " emoji" : "")
                }
              >
                <span className="desc">{msg.me ? owner || "Me" : name}: </span>
                {formatText(msg.text)}
                {msg.tapback ? (
                  <span className="tapback">
                    <span className="desc"> · Tapback:</span>
                    {msg.tapback}
                  </span>
                ) : null}
              </p>
              {phone.showStatus && i === lastRead ? (
                <p className="status">
                  <span className="desc">Status: </span>Read {readAt}
                </p>
              ) : i === lastDelivered ? (
                <p className="status">
                  <span className="desc">Status: </span>Delivered
                </p>
              ) : null}
            </React.Fragment>
          );
        })}
        <div className="clear" />
      </div>
      <div className="sendbox" />
    </div>
  );
};
