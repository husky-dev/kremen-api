import axios, { AxiosRequestConfig } from 'axios';

import { TGSendMessageOpt, TGSendMessageReducedOpt } from './types';

interface TelegramBotOpt {
  token: string;
}

interface TelegramBotApiReqOpt<D = unknown> {
  path: string;
  data?: D;
}

export type TelegramApi = ReturnType<typeof getTelegramApi>;

export const getTelegramApi = (opt: TelegramBotOpt) => {
  // User

  const getMe = () => apiReq({ path: 'getMe' });

  // Messages

  const sendTextMessage = (chat_id: number | string, text: string, opt?: TGSendMessageReducedOpt) => {
    if (!chat_id) {
      throw new Error('chat_id required');
    }
    const data: TGSendMessageOpt = opt ? { chat_id, text, ...opt } : { chat_id, text };
    return sendMessage(data);
  };

  const sendMessage = (data: TGSendMessageOpt) => apiReq({ path: 'sendMessage', data });

  // API

  const apiReq = async ({ path, data }: TelegramBotApiReqOpt) => {
    const url = `https://api.telegram.org/bot${opt.token}/${path}`;
    const config: AxiosRequestConfig = {
      method: 'GET',
      url,
    };
    if (data) {
      config.data = JSON.stringify(data);
      config.method = 'POST';
      config.headers = {
        'Content-Type': 'application/json',
      };
    }
    const { data: respData } = await axios(config);
    return respData;
  };

  // Export

  return { getMe, sendTextMessage, sendMessage };
};

export * from './types';
export * from './utils';
