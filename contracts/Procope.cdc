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
    
    init(
      index: Int,
      title: String,
      content: String,
    ) {
      self.index = index
      self.title = title
      self.content = content
    }
  }

  pub resource Post {
    pub let index: Int
    pub let title: String
    pub let content: String

    init(
      index: Int,
      title: String,
      content: String,
    ) {
      self.index = index
      self.title = title
      self.content = content
    }

    pub fun asReadOnly(): ReadOnlyPost {
      return ReadOnlyPost(
        index: self.index,
        title: self.title,
        content: self.content,
      );
    }
  }

  pub resource interface HasPosts {
    pub fun asReadOnly(page: Int): ReadOnlyPostStore
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
    ) {
      let index = self.posts.length
      let post <- create Post(index: index, title: title, content: content)
      self.posts.append(<-post)
    }

    pub fun asReadOnly(page: Int): ReadOnlyPostStore {
      let endIndex = self.max(0, self.posts.length - 16);
      let posts: [ReadOnlyPost] = []

      var i = endIndex
      while i < self.posts.length {
        posts.append(self.posts[i].asReadOnly())
        i = i + 1
      }
      
      return ReadOnlyPostStore(
        totalCount: self.posts.length,
        posts: posts,
      )
    }

    priv fun max(_ a: Int, _ b: Int): Int {
      if (a > b) {
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
} 
 