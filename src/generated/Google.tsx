import React from "react";
import {
  formatText,
  formatFirstLetter,
  formatGoogleTimestamp,
  longSince,
  emojiOnly,
} from "../lib/formatters";
import { Contact, MessageBlock } from "../types/Phone";

interface PhoneProps {
  phone: MessageBlock;
  owner?: string;
  contact?: Contact;
  now?: Date;
}

function mult32(m: number, n: number): number {
  return (m & 0xffff) * n + ((((m >>> 16) * n) & 0xffff) << 16);
}

function rotate32(m: number, n: number): number {
  return (m << n) | (m >>> (32 - n));
}

function scramble(m: number): number {
  return mult32(rotate32(mult32(m, 0xcc9e2d51), 15), 0x1b873593);
}

export const hash = function (key: string, seed?: number) {
  const keyData = new TextEncoder().encode(key);
  const remainder = keyData.length % 4;

  let h1 = seed || 0;
  let k1 = 0;

  for (let i = 0; i < keyData.length; i = i + 4) {
    k1 =
      keyData[i] |
      (keyData[i + 1] << 8) |
      (keyData[i + 2] << 16) |
      (keyData[i + 3] << 24);

    h1 ^= scramble(k1);
    h1 = rotate32(h1, 13);
    h1 = mult32(h1, 5) + 0xe6546b64;
  }

  if (remainder > 0) {
    k1 = 0;
    const offset = keyData.length - remainder;
    for (let i = 0; i < remainder; i++) {
      k1 |= keyData[offset + i] << (8 * i);
    }
    h1 ^= scramble(k1);
  }

  h1 ^= keyData.length;
  h1 = h1 ^ (h1 >>> 16);
  h1 = mult32(h1, 0x85ebca6b);
  h1 = h1 ^ (h1 >>> 13);
  h1 = mult32(h1, 0xc2b2ae35);
  h1 = h1 ^ (h1 >>> 16);

  return h1 >>> 0;
};

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
  const displayName = contact?.displayName || phone.phoneNumber || "";
  const name = contact?.name || phone.phoneNumber;
  return (
    <div className="googlem">
      {phone.header ? (
        <div className={`header co${hash(displayName) % 7}`}>
          <div className="back" />
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
              <span className="desc">Google Messages from </span>
              {displayName}
            </h5>
          </div>
          <div className="callicon">
            <div className="audio" />
            <div className="menumore" />
          </div>
        </div>
      ) : (
        <h5 className="desc">Google Messages from {displayName}</h5>
      )}
      <div className={`body co${hash(displayName) % 7}`}>
        {phone.messages.map((msg, i) => {
          const showTimestamp =
            msg.sent &&
            (i === 0 || longSince(msg, phone.messages[i - 1], 60 * 60 * 1000));
          const breakpoint =
            !showTimestamp && longSince(msg, phone.messages[i - 1]);
          return (
            <React.Fragment key={i}>
              {showTimestamp ? (
                <p className="timestamp">
                  {formatGoogleTimestamp(now, msg.sent)}
                </p>
              ) : null}
              {breakpoint ? <div className="breakpoint" /> : null}
              <div
                className={
                  "msg-row " +
                  (msg.me ? "me" : "you") +
                  (emojiOnly(msg.text) ? " emoji" : "") +
                  (msg.tapback ? " tapped" : "")
                }
              >
                <p>
                  <span className="desc">
                    {msg.me ? owner || "Me" : name}:{" "}
                  </span>
                  {formatText(msg.text)}
                  {msg.tapback ? (
                    <span className="tapback">
                      <span className="desc"> · Tapback:</span> {msg.tapback}
                    </span>
                  ) : null}
                </p>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
