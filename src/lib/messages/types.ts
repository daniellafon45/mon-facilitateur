export type ConvoKind = "dm" | "team" | "atelier";

export type MessageFrom = "me" | "other" | "system";

export interface ChatMessage {
  id: string;
  from: MessageFrom;
  name: string;
  text: string;
  ts: string;
}

export interface Conversation {
  id: string;
  kind: ConvoKind;
  name: string;
  color: string;
  unread: number;
  messages: ChatMessage[];
  members?: string[];
  archived?: boolean;
  hidden?: boolean;
}

export type ConvoTab = "tous" | "dm" | "team" | "arch";

export interface ContactRef {
  id: string;
  name: string;
  color?: string;
}

export interface TeamRef {
  id: string;
  name: string;
  color?: string;
  memberIds?: string[];
}
