pub contract Procope {
  pub struct ReadOnlyPostStore {
    pub let totalCount: Int
    pub let posts: [ReadOnlyPost]

    init(
      totalCount: Int,
      posts: [ReadOnlyPost],
    ) {
      self.totalCount = totalCount
      self.posts = posts
    }
  }

  pub struct ReadOnlyPost {
    pub let index: Int
    pub let title: String
    pub let content: String
    pub let date: UInt64
    
    init(
      index: Int,
      title: String,
      content: String,
      date: UInt64,
    ) {
      self.index = index
      self.title = title
      self.content = content
      self.date = date
    }
  }

  pub resource Post {
    pub let index: Int
    pub let title: String
    pub let content: String
    pub let date: UInt64

    init(
      index: Int,
      title: String,
      content: String,
      date: UInt64,
    ) {
      self.index = index
      self.title = title
      self.content = content
      self.date = date
    }

    pub fun asReadOnly(): ReadOnlyPost {
      return ReadOnlyPost(
        index: self.index,
        title: self.title,
        content: self.content,
        date: self.date,
      );
    }
  }

  pub resource interface HasPosts {
    pub fun asReadOnly(page: Int): ReadOnlyPostStore
    pub fun single(index: Int): ReadOnlyPost?
  }

  pub resource PostStore: HasPosts {
    pub let posts: @[Post]
  
    init() {
      self.posts <- [];
    }

    destroy() {
      destroy self.posts
    }

    pub fun addPost(
      title: String,
      content: String,
      date: UInt64,
    ) {
      let index = self.posts.length
      let post <- create Post(index: index, title: title, content: content, date: date)
      self.posts.append(<-post)
    }

    pub fun asReadOnly(page: Int): ReadOnlyPostStore {
      if (page < 0) {
        panic("Page must be > 0")
      }

      let startIndex = self.max(0, self.posts.length - (16 * (page + 1)));
      let endIndex = self.max(0, self.posts.length - (16 * page))
      let posts: [ReadOnlyPost] = []

      var i = startIndex
      while i < endIndex {
        posts.append(self.posts[i].asReadOnly())
        i = i + 1
      }
      
      return ReadOnlyPostStore(
        totalCount: self.posts.length,
        posts: posts,
      )
    }

    pub fun single(index: Int): ReadOnlyPost? {
      if (index >= 0 && index < self.posts.length) {
        return self.posts[index].asReadOnly()
      }
      return nil
    }

    priv fun max(_ a: Int, _ b: Int): Int {
      if (a > b) {
        return a
      }
      return b
    }

    priv fun min(_ a: Int, _ b: Int): Int {
      if (a < b) {
        return a
      }
      return b
    }
  }

  pub fun createPostStore(): @PostStore {
    return <- create PostStore()
  }

  pub fun exists(address: Address): Bool {
    let postStore = getAccount(address)
      .getCapability<&Procope.PostStore{Procope.HasPosts}>(/public/Feed)
      .borrow()
    return postStore != nil
  }

  pub fun read(address: Address, page: Int): ReadOnlyPostStore? {
    if let postStore = getAccount(address)
      .getCapability<&Procope.PostStore{Procope.HasPosts}>(/public/Feed)
      .borrow() {
      return postStore.asReadOnly(page: page)
    } else {
      return nil
    }
  }

  pub fun readSinglePost(address: Address, index: Int): ReadOnlyPost? {
    if let postStore = getAccount(address)
      .getCapability<&Procope.PostStore{Procope.HasPosts}>(/public/Feed)
      .borrow() {
      return postStore.single(index: index)
    } else {
      return nil
    }
  }
}
