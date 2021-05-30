pub contract Procope {
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
  }

  pub resource interface HasPosts {
    pub let count: Int
    pub let latest: @Post?
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
} 
 