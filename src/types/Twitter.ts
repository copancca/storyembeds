export interface TwitterData {
  Users: Record<string, User>;
  ThreadBlocks: ThreadBlock[];
}

export interface User {
  name: string;
  handle: string;
  pfp?: string;
}

export interface ThreadBlock {
  Tweets: Tweet[];
}

export interface Tweet {
  user: User;
  text: string;
  timestamp: Date;
  replies?: Tweet[];
  likes?: number;
  retweets?: number;
  quotes?: number;
  parent?: Tweet;
  replyto?: User;
  quoted?: Tweet;
}
