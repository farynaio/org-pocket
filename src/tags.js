class Tags {
  constructor(line) {
    let tags = /  :.*:$/.exec(line)
    this.tags = tags ? tags[0].trim().split(':').filter(i => i) : []
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) this.tags.push(tag)
  }

  getTags() {
    return this.tags
  }

  getTagsString(){
    return `:${this.tags.join(':')}:`
  }
}

module.exports = Tags