export const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getTs = (): number => new Date().getTime();
