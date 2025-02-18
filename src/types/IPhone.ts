export interface IPhoneData {
  now?: Date;
  messageBlocks: MessageBlock[];
}

export interface MessageBlock {
  contact?: Contact;
  phoneNumber?: string;
  now?: Date;
  supportsIMessage?: boolean;
  showStatus?: boolean;
  messages: Message[];
}

export interface Contact {
  name: string;
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
