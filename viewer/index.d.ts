export { }

declare global {
  interface ILogin { }
  interface IFeed { }

  interface Window {
    login: ILogin;
    feed: IFeed;
  }
}