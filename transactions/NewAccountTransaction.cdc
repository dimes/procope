import Procope from 0x01cf0e2f2f715450

transaction {
  prepare(signer: AuthAccount) {
    if let postStore <- signer.load<@Procope.PostStore>(from: /storage/Posts) {
      signer.save(<-postStore, to: /storage/Posts)
      panic("Post store already exists")
    }

    let postStore <- Procope.createEmptyPostStore()
    signer.save(<-postStore, to: /storage/Posts)

    signer.link<&Procope.PostStore{Procope.HasPosts}>(/public/Feed, target: /storage/Posts)
  }
}