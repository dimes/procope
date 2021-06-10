export { }

declare global {
  interface IFeed { }

  interface Window {
    feed: IFeed;
  }
}
