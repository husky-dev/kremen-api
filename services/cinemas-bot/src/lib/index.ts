import { config } from '@config';
import { getTelegramApi, isBotCmd, Log, TGMessage, TGUpdate } from '@core';
import { isNum, isUnknownDict } from '@utils';

const helloText = `Привіт ✋`;
const noUnderstandText = `Схоже я тебе не розумію 😕`;

const log = Log('lib');

const getBot = () => {
  const telegram = getTelegramApi({ token: config.bot.token });

  const processWebhookReq = async (data: unknown) => {
    if (isTGUpdate(data) && data.message) {
      await processTextMsg(data.message);
    } else {
      log.err('unknown update with data=', data);
    }
  };

  const processTextMsg = async (msg: TGMessage): Promise<void> => {
    const {
      text,
      chat: { id: chatId },
    } = msg;
    if (!text) {
      return;
    }
    log.debug(`[${chatId}] processing text msg`);

    if (isBotCmd(text, 'start')) {
      return sendTextMsg(chatId, helloText);
    }

    return sendTextMsg(chatId, noUnderstandText);
  };

  const sendTextMsg = async (chatId: number, val: string) => telegram.sendTextMessage(chatId, val);

  // const sendMarkdownMsg = async (chatId: number, val: string) =>
  //   telegram.sendTextMessage(chatId, val, { parse_mode: 'Markdown' });

  return { processWebhookReq };
};

const isTGUpdate = (val: unknown): val is TGUpdate => isUnknownDict(val) && isNum(val.update_id);

export const cinemasBot = getBot();
