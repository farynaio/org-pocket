export class Tags {
  tags: string[]

  constructor(line: string) {
    const tags = / {2}:.*:$/.exec(line)
    this.tags = tags ? tags[0].trim().split(':').filter(i => i) : []
  }

  addTag(tag: string) {
    if (!this.tags.includes(tag)) this.tags.push(tag)
  }

  getTags() {
    return this.tags
  }

  getTagsString(){
    return `:${this.tags.join(':')}:`
  }
}