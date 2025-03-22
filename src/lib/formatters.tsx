import React from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface sentType {
  sent?: Date;
}

export function longSince(
  msg: sentType,
  prevMsg: sentType,
  delay: number = 1000 * 60 * 10
) {
  if (!msg.sent || !prevMsg.sent) return false;
  return msg.sent.getTime() - prevMsg.sent.getTime() > delay;
}

export function formatTwitterTimestamp(d: Date) {
  if (isNaN(d.getTime())) return "00:00 ∙ Jan 01, 1970"; // fallback
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${hh}:${mm} ∙ ${month} ${day}, ${year}`;
}

export function formatTwitterShortTimestamp(d: Date) {
  if (isNaN(d.getTime())) return "Jan 01"; // fallback
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  return `${month} ${day}`;
}

export function formatIOSTimestamp(now?: Date, d?: Date) {
  if (!now || !d) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  if (
    now.getDate() === d.getDate() &&
    now.getMonth() === d.getMonth() &&
    now.getFullYear() === d.getFullYear()
  ) {
    return (
      <React.Fragment>
        <span className="ts-date">Today</span> {hours}:{minutes}
      </React.Fragment>
    );
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return (
      <React.Fragment>
        <span className="ts-date">Yesterday</span> {hours}:{minutes}
      </React.Fragment>
    );
  }
  // if the date is within the last week, show the day
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (d > weekAgo) {
    return (
      <React.Fragment>
        <span className="ts-date">{days[d.getDay()]}</span> {hours}:{minutes}
      </React.Fragment>
    );
  }
  if (now.getFullYear() === d.getFullYear()) {
    return (
      <React.Fragment>
        <span className="ts-date">
          {month} {day}
        </span>{" "}
        {hours}:{minutes}
      </React.Fragment>
    );
  }
  return (
    <span className="ts-date">
      {month} {day}, {year}
    </span>
  );
}

export function formatIOSReadTimestamp(now?: Date, d?: Date): string | null {
  if (!now || !d) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  if (
    now.getDate() === d.getDate() &&
    now.getMonth() === d.getMonth() &&
    now.getFullYear() === d.getFullYear()
  ) {
    return `${hours}:${minutes}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday ${hours}:${minutes}`;
  }
  // if the date is within the last week, show the day
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (d > weekAgo) {
    return `${days[d.getDay()]} ${hours}:${minutes}`;
  }
  if (now.getFullYear() === d.getFullYear()) {
    return `${month} ${day} ${hours}:${minutes}`;
  }
  return `${month} ${day}, ${year}`;
}

export function formatGoogleTimestamp(now?: Date, d?: Date): string | null {
  if (!now || !d) return null;
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours =
    d.getHours() < 12
      ? d.getHours() === 0
        ? "12"
        : d.getHours()
      : d.getHours() - 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const amPM = d.getHours() < 12 ? "AM" : "PM";
  if (
    now.getDate() === d.getDate() &&
    now.getMonth() === d.getMonth() &&
    now.getFullYear() === d.getFullYear()
  ) {
    return `${hours}:${minutes} ${amPM}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday ${hours}:${minutes} ${amPM}`;
  }
  // if the date is within the last week, show the day
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (d > weekAgo) {
    return `${days[d.getDay()]} • ${hours}:${minutes} ${amPM}`;
  }
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  yearAgo.setHours(0);
  yearAgo.setMinutes(0);
  yearAgo.setSeconds(0);
  yearAgo.setMilliseconds(0);
  if (d > yearAgo) {
    return `${days[d.getDay()]}, ${month} ${day} • ${hours}:${minutes} ${amPM}`;
  }
  return `${
    days[d.getDay()]
  }, ${month} ${day}, ${year} • ${hours}:${minutes} ${amPM}`;
}

export function formatInstagramTimestamp(now?: Date, d?: Date): string | null {
  if (!now || !d) return null;
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  if (
    now.getDate() === d.getDate() &&
    now.getMonth() === d.getMonth() &&
    now.getFullYear() === d.getFullYear()
  ) {
    return `${hours}:${minutes}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday ${hours}:${minutes}`;
  }
  // if the date is within the last week, show the day
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (d > weekAgo) {
    return `${days[d.getDay()]} ${hours}:${minutes}`;
  }
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  if (d > yearAgo) {
    return `${month} ${day}, ${hours}:${minutes}`;
  }
  return `${month} ${day}, ${year}`;
}

export function formatTwitterCount(num?: number): string {
  if (!num) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
}

export function tagHandles(line: string): (string | React.JSX.Element)[] {
  return line.split(/(\s+)/).map((segment, j) => {
    if (segment.match(/^@[a-zA-Z0-9_]+$/)) {
      return (
        <span key={j} className="hl">
          {segment}
        </span>
      );
    } else if (segment.match(/^#[a-zA-Z0-9_]+$/)) {
      return (
        <span key={j} className="hl">
          {segment}
        </span>
      );
    }
    return segment;
  });
}

export function formatFirstLetter(contactName: string): string | null {
  const firstLetter = contactName.trim().match(/^(?:[\p{L}\p{N}])/u);
  return firstLetter ? firstLetter[0].toUpperCase() : null;
}

export function formatText(
  text: string,
  lineFunc: (line: string) => string | (string | React.JSX.Element)[] = (
    line: string
  ) => line
) {
  return text.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 ? <br /> : null}
      {lineFunc(line)}
    </React.Fragment>
  ));
}

export function emojiOnly(text: string): boolean {
  return text
    .trim()
    .match(
      /^(?:\p{Emoji}(?:\p{Emoji_Modifier}|️|\uFE0F|\u200D[\p{Emoji}])+|\p{Emoji_Presentation}|\p{Extended_Pictographic})+$/u
    )
    ? true
    : false;
}
