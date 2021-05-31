pub contract Procope {
  pub struct ReadOnlyPostStore {
    pub let count: Int
    pub let latest: ReadOnlyPost?

    init(
      count: Int,
      latest: ReadOnlyPost?,
    ) {
      self.count = count
      self.latest = latest
    }
  }

  pub struct ReadOnlyPost {
    pub let title: String;
    pub let content: String;
    pub let previous: ReadOnlyPostStore?;
    
    init(
      title: String,
      content: String,
      previous: ReadOnlyPostStore?
    ) {
      self.title = title
      self.content = content
      self.previous = previous
    }
  }

  pub resource Post {
    pub let title: String
    pub let content: String
    pub let previous: @PostStore?

    init(
      title: String,
      content: String,
      previous: @PostStore?
    ) {
      self.title = title
      self.content = content
      self.previous <- previous
    }

    destroy() {
      destroy self.previous
    }

    pub fun asReadOnly(): ReadOnlyPost {
      return ReadOnlyPost(
        title: self.title,
        content: self.content,
        previous: self.previous?.asReadOnly(),
      );
    }
  }

  pub resource interface HasPosts {
    pub let count: Int
    pub let latest: @Post?

    pub fun asReadOnly(): ReadOnlyPostStore
  }

  pub resource PostStore: HasPosts {
    pub let count: Int
    pub let latest: @Post?
  
    init(
      count: Int,
      latest: @Post?,
    ) {
      self.count = count
      self.latest <- latest
    }

    destroy() {
      destroy self.latest
    }

    pub fun asReadOnly(): ReadOnlyPostStore {
      return ReadOnlyPostStore(
        count: self.count,
        latest: self.latest?.asReadOnly(),
      )
    }
  }

  pub fun createEmptyPostStore(): @PostStore {
    return <- create PostStore(count: 0, latest: nil)
  }

  pub fun addPost(
    title: String,
    content: String,
    previous: @PostStore,
  ): @PostStore {
    let count = previous.count
    let post <- create Post(title: title, content: content, previous: <-previous)
    let postStore <- create PostStore(count: count + 1, latest: <-post)
    return <-postStore
  }

  pub fun read(address: Address): ReadOnlyPostStore? {
    if let postStore = getAccount(address)
      .getCapability<&Procope.PostStore{Procope.HasPosts}>(/public/Feed)
      .borrow() {
      return postStore.asReadOnly()
    } else {
      return nil
    }
  }
} 
 