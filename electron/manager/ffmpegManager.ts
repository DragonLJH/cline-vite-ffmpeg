
import { videoService, TranscodeParams, MediaInfo } from "../services/videoService"
import { FFmpegProgress } from "../ffmpeg/progressParser"
import { WatermarkItem } from "../ffmpeg/FFmpegCommandBuilder"

// 统一返回类型
interface TaskResult {
  taskId: string
  success: boolean
  error?: string
}

// 性能配置接口
export interface PerformanceConfig {
  maxThreads?: number     // 最大线程数
  preset?: string         // 编码预设
  priority?: 'low' | 'normal' | 'high'  // 进程优先级
  memoryLimit?: string    // 内存限制
}

class FfmpegManager {
  /**
   * 转码（完整能力）
   * @param params 转码参数
   * @param pCallback 进度回调
   * @param performanceConfig 性能配置（可选）
   */
  async run(
    params: TranscodeParams,
    pCallback?: (res: { taskId: string; progress: FFmpegProgress }) => void,
    performanceConfig?: PerformanceConfig
  ): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    // 如果提供了性能配置，将其合并到params中
    const finalParams = performanceConfig 
      ? { ...params, performance: performanceConfig }
      : params

    const task = videoService.transcode(finalParams, (progress) => {
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
   * @param startTime 水印开始时间（秒）
   * @param endTime 水印结束时间（秒）
   * @param size 水印大小（百分比，1-100）
   * @param pCallback 进度回调
   */
  async addWatermark(
    input: string,
    output: string,
    watermarkImage: string,
    x: number = 10,
    y: number = 10,
    startTime?: string,
    endTime?: string,
    size?: number,
    pCallback?: (res: { taskId: string; progress: FFmpegProgress }) => void
  ): Promise<TaskResult> {
    const taskId = `task_${Date.now()}`

    const task = videoService.transcode({
      input,
      output,
      watermark: {
        image: watermarkImage,
        x,
        y,
        start: startTime,
        end: endTime,
        size
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

  /**
   * 添加多个视频水印（一次性处理，支持图片和文字混合）
   * @param input 输入文件路径
   * @param output 输出文件路径
   * @param watermarks 水印数组（支持图片和文字类型）
   * @param pCallback 进度回调
   */
  async addWatermarks(
    input: string,
    output: string,
    watermarks: WatermarkItem[],
    pCallback?: (res: { taskId: string; progress: FFmpegProgress }) => void
  ): Promise<TaskResult & { outputPath?: string }> {
    const taskId = `task_${Date.now()}`

    const task = videoService.addWatermarks({
      input,
      output,
      watermarks
    }, (progress) => {
      pCallback?.({ taskId, progress })
    })

    try {
      await task.result
      return { taskId, success: true, outputPath: output }
    } catch (err: any) {
      return { taskId, success: false, error: err.message }
    }
  }

  /**
   * 获取媒体信息
   * @param input 输入文件路径
   * @returns 媒体信息
   */
  async getMediaInfo(input: string): Promise<MediaInfo> {
    return await videoService.getMediaInfo(input)
  }
}

export const ffmpegManager = new FfmpegManager()
