import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import { parseProgress, timeToSeconds, FFmpegProgress } from "./progressParser"

export interface ExecutorOptions {
  duration?: number
  onProgress?: (p: FFmpegProgress) => void
  onLog?: (log: string) => void
}

export interface FFmpegResult {
  success: boolean
  code: number | null
  signal: NodeJS.Signals | null
  stdout: string
  stderr: string
}

export interface FFmpegTask {
  process: ChildProcessWithoutNullStreams
  cancel: () => void
  result: Promise<FFmpegResult>
}

export class FFmpegExecutor {

  private ffmpegPath = "ffmpeg"

  run(args: string[], options: ExecutorOptions = {}): FFmpegTask {

    const proc = spawn(this.ffmpegPath, args)

    let stdout = ""
    let stderr = ""

    const result = new Promise<FFmpegResult>((resolve, reject) => {

      proc.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      proc.stderr.on("data", (data) => {

        const line = data.toString()
        stderr += line

        options.onLog?.(line)

        const progress = parseProgress(line)

        if (progress) {

          if (options.duration && progress.time) {

            const sec = timeToSeconds(progress.time)
            progress.percent = (sec / options.duration) * 100

          }

          options.onProgress?.(progress)
        }

      })

      proc.on("close", (code, signal) => {

        resolve({
          success: code === 0,
          code,
          signal,
          stdout,
          stderr
        })

      })

      proc.on("error", reject)

    })

    return {
      process: proc,
      cancel: () => proc.kill("SIGTERM"),
      result
    }

  }

}