export type TGChatId = string | number;

export interface TGUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TGChatPhoto {
  small_file_id?: string;
  big_file_id?: string;
}

export interface TGChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  all_members_are_administrators?: boolean;
  photo?: TGChatPhoto;
  description?: string;
  invite_link?: string;
  pinned_message?: TGMessage;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
}

export interface TGMessage {
  message_id: number;
  from?: TGUser;
  date: number;
  chat: TGChat;
  forward_from?: TGUser;
  forward_from_chat?: TGChat;
  forward_from_message_id?: number;
  forward_signature?: string;
  forward_date?: number;
  reply_to_message?: TGMessage;
  edit_date?: number;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  group_chat_created?: boolean;
}

export interface TGUpdate {
  update_id: number;
  message?: TGMessage;
}

export interface TGSendMessageOpt {
  chat_id: TGChatId;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
}

export interface TGSendMessageReducedOpt {
  parse_mode?: 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
}
