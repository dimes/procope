import Procope from 0x01cf0e2f2f715450

transaction /*(
  title: String,
  content: String,
)*/ {
  prepare(signer: AuthAccount) {
    if let previous <- signer.load<@Procope.PostStore>(from: /storage/Posts) {
      let postStore <- Procope.addPost(title: "Test Title", content: "Test Content", previous: <-previous)
      signer.save(<-postStore, to: /storage/Posts)
    } else {
      panic("No previous post store to add post to")
    }
  }
}
