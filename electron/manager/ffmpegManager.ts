
import { videoService } from "../services/videoService"
import { FFmpegProgress } from "../ffmpeg/progressParser"
class FfmpegManager {
  async run(params: any, pCallback: (res: {
    taskId: string;
    progress: FFmpegProgress
  }) => void) {
    const taskId = `task_${Date.now()}`

    const task = videoService.transcode(
      params,
      (progress) => {
        pCallback({
          taskId,
          progress
        })
      }
    )

    try {

      await task.result

      return {
        taskId,
        success: true
      }

    } catch (err: any) {

      return {
        taskId,
        success: false,
        error: err.message
      }

    }
  }
}

export const ffmpegManager = new FfmpegManager()
