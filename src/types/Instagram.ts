export interface InstaData {
  now?: Date;
  owner?: string;
  accounts: Record<string, InstaAccount>;
  messageBlocks: MessageBlock[];
}

export interface InstaAccount {
  name: string;
  pfp: string;
}

export interface MessageBlock {
  account: string;
  header: boolean;
  now?: Date;
  messages: Message[];
}

export interface Contact {
  name: string;
  pfp?: string;
}

export interface Message {
  me: boolean;
  text: string;
  sent?: Date;
  tapback?: string;
}
