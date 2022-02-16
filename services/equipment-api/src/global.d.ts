declare module '*.json' {
  const content: unknown;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}
