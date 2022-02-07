import { config } from '@config';
import { getTelegramApi, isBotCmd, Log, TGMessage, TGUpdate } from '@core';
import { getApi, KremenCinema } from '@core/api';
import { errToStr, isNum, isUnknownDict, unique } from '@utils';

const helloText = `Привіт ✋`;
const noUnderstandText = `Схоже я тебе не розумію 😕`;

const log = Log('lib');

const getBot = () => {
  const telegram = getTelegramApi({ token: config.bot.token });
  const api = getApi({ apiRoot: 'http://cinemas-ds:8080/' });

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

    if (isBotCmd(text, 'schedule')) {
      return processScheduleCmd(chatId);
    }

    return sendTextMsg(chatId, noUnderstandText);
  };

  const processScheduleCmd = async (chatId: number) => {
    try {
      const cinemas = await api.cinemas.list();
      const text = cinemasToMoviesMsg(cinemas);
      return sendTextMsg(chatId, text);
    } catch (err: unknown) {
      log.err('process schedule cmd err', { msg: errToStr(err) });
    }
  };

  const sendTextMsg = async (chatId: number, val: string) => telegram.sendTextMessage(chatId, val);

  // const sendMarkdownMsg = async (chatId: number, val: string) =>
  //   telegram.sendTextMessage(chatId, val, { parse_mode: 'Markdown' });

  return { processWebhookReq };
};

const isTGUpdate = (val: unknown): val is TGUpdate => isUnknownDict(val) && isNum(val.update_id);

const cinemasToMoviesMsg = (cinemas: KremenCinema[]): string => {
  const titles: string[] = [];
  for (const cinema of cinemas) {
    for (const movie of cinema.movies) {
      if (movie.type === 'going') {
        titles.push(movie.title);
      }
    }
  }
  return unique(titles)
    .map(itm => `🍿 ${itm}`)
    .join(`\n\n`);
};

export const cinemasBot = getBot();
