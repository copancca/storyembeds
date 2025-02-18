export interface InstaData {
  now?: Date;
  messageBlocks: MessageBlock[];
}

export interface MessageBlock {
  contact: Contact;
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
