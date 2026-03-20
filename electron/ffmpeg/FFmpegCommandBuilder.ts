type InputItem = {
  file: string
  options: string[]
}

export class FFmpegCommandBuilder {

  private globalArgs: string[] = []
  private inputs: InputItem[] = []
  private filters: string[] = []
  private outputArgs: string[] = []
  private outputs: string[] = []

  // ========================
  // 全局
  // ========================
  overwrite() {
    this.globalArgs.push("-y")
    return this
  }

  // ========================
  // 输入
  // ========================
  input(file: string) {

    this.inputs.push({
      file,
      options: []
    })

    return this
  }

  private getLastInput() {

    if (this.inputs.length === 0) {
      throw new Error("请先调用 input()")
    }

    return this.inputs[this.inputs.length - 1]
  }

  // 快速 seek（-ss 在 input 前）
  seekInput(time: string) {

    const input = this.getLastInput()
    input.options.unshift("-ss", time)

    return this
  }

  // ========================
  // 输出阶段参数
  // ========================

  // 精确 seek（-ss 在 input 后）
  seekOutput(time: string) {
    this.outputArgs.push("-ss", time)
    return this
  }

  duration(time: string) {
    this.outputArgs.push("-t", time)
    return this
  }

  // ========================
  // 视频
  // ========================
  videoCodec(codec: string) {
    this.outputArgs.push("-vcodec", codec)
    return this
  }

  bitrate(rate: string) {
    this.outputArgs.push("-b:v", rate)
    return this
  }

  fps(fps: number) {
    this.outputArgs.push("-r", String(fps))
    return this
  }

  size(size: string) {
    this.outputArgs.push("-s", size)
    return this
  }

  // ========================
  // 音频
  // ========================
  audioCodec(codec: string) {
    this.outputArgs.push("-acodec", codec)
    return this
  }

  audioBitrate(rate: string) {
    this.outputArgs.push("-b:a", rate)
    return this
  }

  noAudio() {
    this.outputArgs.push("-an")
    return this
  }

  // ========================
  // 图片
  // ========================

  // 图片输入（可 loop）
  imageInput(file: string, loop = false) {

    const options: string[] = []

    if (loop) {
      options.push("-loop", "1")
    }

    this.inputs.push({ file, options })

    return this
  }

  // 水印（支持时间控制）
  watermark(image: string, x = 10, y = 10, start?: string, end?: string) {

    this.imageInput(image)

    // 如果有时间参数，使用 enable 参数控制水印出现时间
    if (start !== undefined && end !== undefined) {
      this.filters.push(`overlay=enable='between(t,${start},${end})':x=${x}:y=${y}`)
    } else {
      this.filters.push(`overlay=${x}:${y}`)
    }

    return this
  }

  // 封面（ID3）
  attachCover(image: string) {

    this.imageInput(image)

    this.outputArgs.push("-map", "0")
    this.outputArgs.push("-map", "1")
    this.outputArgs.push("-c", "copy")
    this.outputArgs.push("-disposition:v:0", "attached_pic")

    return this
  }

  // ========================
  // metadata
  // ========================
  metadata(key: string, value: string) {
    this.outputArgs.push("-metadata", `${key}=${value}`)
    return this
  }

  id3(tags: {
    title?: string
    artist?: string
    album?: string
    genre?: string
    year?: string
  }) {

    if (tags.title) this.metadata("title", tags.title)
    if (tags.artist) this.metadata("artist", tags.artist)
    if (tags.album) this.metadata("album", tags.album)
    if (tags.genre) this.metadata("genre", tags.genre)
    if (tags.year) this.metadata("date", tags.year)

    return this
  }

  // ========================
  // 扩展
  // ========================
  custom(...args: string[]) {
    this.outputArgs.push(...args)
    return this
  }

  // ========================
  // 输出
  // ========================
  output(file: string) {
    this.outputs.push(file)
    return this
  }


  // ========================
  // build
  // ========================

  build(): string[] {

    const args: string[] = []

    // global
    args.push(...this.globalArgs)

    // inputs
    this.inputs.forEach(input => {
      args.push(...input.options)
      args.push("-i", input.file)
    })

    // filter
    if (this.filters.length > 0) {
      // 当有多个输入文件时，需要使用 -filter_complex
      if (this.inputs.length > 1) {
        // 为 overlay filter 添加输入流标记
        const filterWithStreams = this.filters.map(filter => {
          if (filter.startsWith("overlay=")) {
            return `[0:v][1:v]${filter}`
          }
          return filter
        })
        args.push("-filter_complex", filterWithStreams.join(";"))
      } else {
        args.push("-vf", this.filters.join(","))
      }
    }

    // output args
    args.push(...this.outputArgs)

    // outputs
    this.outputs.forEach(output => {
      args.push(output)
    })
    console.log('[build]', args.join(' '))
    return args
  }

}
