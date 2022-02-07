export const isBotCmd = (text: string, name?: string): boolean => {
  if (!/\/[\w\d_-]+/g.test(text)) {
    return false;
  }
  return name ? text.indexOf(`/${name}`) === 0 : true;
};

export const strFromBotCmd = (text: string): string | undefined => {
  const match = /\/[\w\d_-]+ ([\w\d_-]+)/g.exec(text);
  return match ? match[1] : undefined;
};
