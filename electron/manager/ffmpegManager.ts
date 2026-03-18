
import { videoService, TranscodeParams } from "../services/videoService"
import { FFmpegProgress } from "../ffmpeg/progressParser"

// 统一返回类型
interface TaskResult {
  taskId: string
  success: boolean
  error?: string
}

class FfmpegManager {
  /**
   * 转码（完整能力）
   * @param params 转码参数
   * @param pCallback 进度回调
   */
  async run(
    params: TranscodeParams,
    pCallback?: (res: { taskId: string; progress: FFmpegProgress }) => void
  ): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    const task = videoService.transcode(params, (progress) => {
      pCallback?.({ taskId, progress })
    })

    try {
      await task.result
      return { taskId, success: true }
    } catch (err: any) {
      return { taskId, success: false, error: err.message }
    }
  }

  /**
   * 截图（快速模式）
   * @param input 输入文件路径
   * @param time 截图时间点（如 "00:00:01"）
   * @param output 输出文件路径
   */
  async screenshot(input: string, time: string, output: string): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    const task = videoService.screenshot(input, time, output)

    try {
      await task.result
      return { taskId, success: true }
    } catch (err: any) {
      return { taskId, success: false, error: err.message }
    }
  }

  /**
   * 精确截图
   * @param input 输入文件路径
   * @param time 截图时间点（如 "00:00:01"）
   * @param output 输出文件路径
   */
  async screenshotAccurate(input: string, time: string, output: string): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    const task = videoService.screenshotAccurate(input, time, output)

    try {
      await task.result
      return { taskId, success: true }
    } catch (err: any) {
      return { taskId, success: false, error: err.message }
    }
  }

  /**
   * 裁剪视频
   * @param input 输入文件路径
   * @param output 输出文件路径
   * @param start 开始时间
   * @param duration 持续时长
   * @param precise 是否使用精确模式（默认 false）
   */
  async cut(
    input: string,
    output: string,
    start: string,
    duration: string,
    precise: boolean = false
  ): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    const task = videoService.cut(input, output, start, duration, precise)

    try {
      await task.result
      return { taskId, success: true }
    } catch (err: any) {
      return { taskId, success: false, error: err.message }
    }
  }

  /**
   * 添加视频水印
   * @param input 输入文件路径
   * @param output 输出文件路径
   * @param watermarkImage 水印图片路径
   * @param x 水印 X 坐标（默认 10）
   * @param y 水印 Y 坐标（默认 10）
   * @param pCallback 进度回调
   */
  async addWatermark(
    input: string,
    output: string,
    watermarkImage: string,
    x: number = 10,
    y: number = 10,
    pCallback?: (res: { taskId: string; progress: FFmpegProgress }) => void
  ): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    const task = videoService.transcode({
      input,
      output,
      watermark: {
        image: watermarkImage,
        x,
        y
      }
    }, (progress) => {
      pCallback?.({ taskId, progress })
    })

    try {
      await task.result
      return { taskId, success: true }
    } catch (err: any) {
      return { taskId, success: false, error: err.message }
    }
  }
}

export const ffmpegManager = new FfmpegManager()
