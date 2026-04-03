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

  // 水印（支持时间控制和大小调整）
  watermark(image: string, x = 10, y = 10, start?: string, end?: string, size?: number) {

    this.imageInput(image)

    // 如果有 size 参数，先用 scale 调整水印大小
    if (size !== undefined && size !== 100) {
      const scaleRatio = size / 100
      // 如果有时间参数，使用 enable 参数控制水印出现时间
      if (start !== undefined && end !== undefined) {
        this.filters.push(`[1:v]scale=iw*${scaleRatio}:ih*${scaleRatio}[wm];[0:v][wm]overlay=enable='between(t,${start},${end})':x=${x}:y=${y}`)
      } else {
        this.filters.push(`[1:v]scale=iw*${scaleRatio}:ih*${scaleRatio}[wm];[0:v][wm]overlay=${x}:${y}`)
      }
    } else {
      // 如果有时间参数，使用 enable 参数控制水印出现时间
      if (start !== undefined && end !== undefined) {
        this.filters.push(`overlay=enable='between(t,${start},${end})':x=${x}:y=${y}`)
      } else {
        this.filters.push(`overlay=${x}:${y}`)
      }
    }

    return this
  }

  // 多水印支持（一次性处理所有水印，使用 filter_complex）
  watermarks(watermarks: Array<{
    image: string
    x?: number
    y?: number
    start?: string
    end?: string
    size?: number
  }>) {
    if (watermarks.length === 0) {
      return this
    }

    // 为每个水印添加图片输入
    watermarks.forEach((wm) => {
      this.imageInput(wm.image)
    })

    // 构建 filter_complex 字符串
    const filterParts: string[] = []
    
    watermarks.forEach((wm, index) => {
      const x = wm.x ?? 10
      const y = wm.y ?? 10
      const inputIndex = index + 1 // 水印图片输入索引（从1开始，0是视频）
      const prevLabel = index === 0 ? '[0:v]' : `[v${index}]`
      const outputLabel = index === watermarks.length - 1 ? '' : `[v${index + 1}]`

      let overlayFilter = ''
      
    // 如果有 size 参数，先用 scale 调整水印大小
    if (wm.size !== undefined && wm.size !== 100) {
      const scaleRatio = wm.size / 100
      const scaleLabel = `[wm${index}]`
      
      // 构建 scale 滤镜
      const scaleFilter = `[${inputIndex}:v]scale=iw*${scaleRatio}:ih*${scaleRatio}${scaleLabel}`
      
      // 构建 overlay 滤镜
      if (wm.start !== undefined && wm.end !== undefined) {
        overlayFilter = `${prevLabel}${scaleLabel}overlay=enable='between(t,${wm.start},${wm.end})':x=${x}:y=${y}${outputLabel}`
      } else {
        overlayFilter = `${prevLabel}${scaleLabel}overlay=x=${x}:y=${y}${outputLabel}`
      }
      
      filterParts.push(scaleFilter)
      filterParts.push(overlayFilter)
    } else {
      // 直接使用 overlay，需要指定输入流
      if (wm.start !== undefined && wm.end !== undefined) {
        overlayFilter = `${prevLabel}[${inputIndex}:v]overlay=enable='between(t,${wm.start},${wm.end})':x=${x}:y=${y}${outputLabel}`
      } else {
        overlayFilter = `${prevLabel}[${inputIndex}:v]overlay=x=${x}:y=${y}${outputLabel}`
      }
      
      filterParts.push(overlayFilter)
    }
    })

    // 将所有滤镜组合成 filter_complex
    this.filters.push(filterParts.join(';'))

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
  // 性能控制
  // ========================
  
  /**
   * 限制线程数
   * @param count 线程数量（默认：CPU核心数/2）
   */
  threads(count?: number) {
    const threadCount = count ?? Math.max(1, Math.floor(require('os').cpus().length / 2))
    this.outputArgs.push("-threads", String(threadCount))
    return this
  }

  /**
   * 设置编码预设
   * @param preset 预设名称（ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow）
   */
  preset(preset: string) {
    this.outputArgs.push("-preset", preset)
    return this
  }

  /**
   * 添加性能优化参数
   */
  performanceOptions() {
    this.outputArgs.push(
      "-max_muxing_queue_size", "1024",  // 限制复用队列大小，防止内存溢出
      "-avioflags", "direct",            // 直接I/O，减少缓存
      "-fflags", "+fastseek"             // 启用快速seek
    )
    return this
  }

  /**
   * 设置优先级（仅Windows有效）
   * @param priority 优先级：low, normal, high
   */
  priority(priority: 'low' | 'normal' | 'high') {
    // 注意：这个参数需要在executor中特殊处理
    // 这里只是标记，实际执行时会由executor处理
    this.globalArgs.push(`-priority:${priority}`)
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
