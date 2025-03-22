export interface PhoneData {
  now?: Date;
  owner?: string;
  contacts: Record<string, Contact>;
  messageBlocks: MessageBlock[];
}

export interface MessageBlock {
  name?: string;
  contact?: Contact;
  phoneNumber?: string;
  now?: Date;
  supportsIMessage?: boolean;
  showStatus?: boolean;
  messages: Message[];
}

export interface Contact {
  name: string;
  displayName: string;
  pfp?: string;
}

export interface Message {
  me: boolean;
  text: string;
  delivered?: boolean;
  sent?: Date;
  read?: Date;
  tapback?: string;
}
