import { spawn } from 'child_process'
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

class FfmpegUtils {
  private ffmpegPath: string = ''
  private isPathValidated: boolean = false

  /**
   * 获取应用程序内嵌的 FFmpeg 路径
   */
  private getAppFfmpegPath(): string {
    const appPath = app.getAppPath()
    const isDev = !app.isPackaged
    const platform = process.platform

    let ffmpegFileName: string
    if (platform === 'win32') {
      ffmpegFileName = 'ffmpeg.exe'
    } else if (platform === 'darwin') {
      ffmpegFileName = 'ffmpeg'
    } else {
      ffmpegFileName = 'ffmpeg'
    }

    if (isDev) {
      // 开发环境：public/ffmpeg 目录
      if (platform === 'win32') {
        return path.join(appPath, 'public', 'ffmpeg', 'win', ffmpegFileName)
      } else if (platform === 'darwin') {
        return path.join(appPath, 'public', 'ffmpeg', 'mac', ffmpegFileName)
      } else {
        return path.join(appPath, 'public', 'ffmpeg', ffmpegFileName)
      }
    } else {
      // 生产环境：resources/ffmpeg 目录
      if (platform === 'win32') {
        return path.join(process.resourcesPath, 'ffmpeg', 'win', ffmpegFileName)
      } else if (platform === 'darwin') {
        return path.join(process.resourcesPath, 'ffmpeg', 'mac', ffmpegFileName)
      } else {
        return path.join(process.resourcesPath, 'ffmpeg', ffmpegFileName)
      }
    }
  }

  /**
   * 获取 FFmpeg 路径
   */
  private async getFfmpegPath(): Promise<string> {
    if (this.isPathValidated) {
      return this.ffmpegPath
    }
    // 1. 首先检查应用程序内嵌的 FFmpeg
    const appFfmpegPath = this.getAppFfmpegPath()
    const testChild = spawn(appFfmpegPath, ['-version'], { stdio: 'ignore' })
    await new Promise<void>((resolve, reject) => {
      testChild.on('close', (code) => {
        if (code === 0) {
          this.ffmpegPath = appFfmpegPath
          this.isPathValidated = true
          resolve()
        } else {
          reject(new Error('Embedded FFmpeg not working'))
        }
      })
      testChild.on('error', reject)
    })
    return this.ffmpegPath

  }

  /**
   * 检查音频文件是否包含封面
   */
  async checkAudioMetadata(filePath: string): Promise<{ hasCover: boolean }> {
    try {
      const ffmpegPath = await this.getFfmpegPath()

      return new Promise((resolve, reject) => {
        const child = spawn(ffmpegPath, ['-i', filePath, '-f', 'null', '-'], {
          stdio: ['ignore', 'ignore', 'pipe']
        })

        let stderr = ''
        child.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        child.on('close', (code) => {
          try {
            // FFmpeg 检查文件时通常返回 1，这是正常的
            if (code === 0 || code === 1) {
              // 检查是否有视频流（封面图片）
              const hasVideoStream = stderr.includes('Stream') &&
                (stderr.includes('Video') || stderr.includes('Attached Picture') || stderr.includes('APIC'))
              resolve({ hasCover: hasVideoStream })
            } else {
              console.warn(`FFmpeg check failed with code ${code}:`, stderr)
              resolve({ hasCover: false })
            }
          } catch (error) {
            reject(error)
          }
        })

        child.on('error', (error) => {
          console.error('FFmpeg check error:', error)
          resolve({ hasCover: false })
        })
      })
    } catch (error) {
      console.error('Failed to check audio metadata:', error)
      return { hasCover: false }
    }
  }

  /**
   * 提取音频文件的封面图片
   */
  async extractAudioCover(filePath: string): Promise<string | null> {
    try {
      const ffmpegPath = await this.getFfmpegPath()
      const tempDir = os.tmpdir()
      const outputFileName = `cover_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
      const outputPath = path.join(tempDir, outputFileName)

      return new Promise((resolve, reject) => {
        const child = spawn(ffmpegPath, [
          '-i', filePath,
          '-an',           // 移除音频流
          '-vcodec', 'copy', // 复制视频流（封面）
          '-y',            // 覆盖输出文件
          outputPath
        ], {
          stdio: ['ignore', 'ignore', 'pipe']
        })

        let stderr = ''
        child.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        child.on('close', (code) => {
          try {
            if (code === 0 && fs.existsSync(outputPath)) {
              // 读取图片文件并转换为 base64
              const imageBuffer = fs.readFileSync(outputPath)
              const base64 = imageBuffer.toString('base64')

              // 清理临时文件
              try {
                fs.unlinkSync(outputPath)
              } catch (cleanupError) {
                console.warn('Failed to cleanup temp file:', cleanupError)
              }

              resolve(base64)
            } else {
              console.warn(`FFmpeg extract cover failed with code ${code}:`, stderr)
              resolve(null)
            }
          } catch (error) {
            reject(error)
          }
        })

        child.on('error', (error) => {
          console.error('FFmpeg extract cover error:', error)
          resolve(null)
        })
      })
    } catch (error) {
      console.error('Failed to extract audio cover:', error)
      return null
    }
  }

  /**
   * 提取视频文件的第一帧作为缩略图
   */
  async extractVideoThumbnail(filePath: string): Promise<string | null> {
    try {
      const ffmpegPath = await this.getFfmpegPath()
      const tempDir = os.tmpdir()
      const outputFileName = `thumbnail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
      const outputPath = path.join(tempDir, outputFileName)

      return new Promise((resolve, reject) => {
        const child = spawn(ffmpegPath, [
          '-i', filePath,
          '-ss', '00:00:01',    // 从第1秒开始
          '-vframes', '1',      // 只提取1帧
          '-vf', 'scale=300:-1', // 缩放宽度为300px，高度自动计算
          '-y',                 // 覆盖输出文件
          outputPath
        ], {
          stdio: ['ignore', 'ignore', 'pipe']
        })

        let stderr = ''
        child.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        child.on('close', (code) => {
          try {
            if (code === 0 && fs.existsSync(outputPath)) {
              // 读取图片文件并转换为 base64
              const imageBuffer = fs.readFileSync(outputPath)
              const base64 = imageBuffer.toString('base64')

              // 清理临时文件
              try {
                fs.unlinkSync(outputPath)
              } catch (cleanupError) {
                console.warn('Failed to cleanup temp file:', cleanupError)
              }

              resolve(base64)
            } else {
              console.warn(`FFmpeg extract thumbnail failed with code ${code}:`, stderr)
              resolve(null)
            }
          } catch (error) {
            reject(error)
          }
        })

        child.on('error', (error) => {
          console.error('FFmpeg extract thumbnail error:', error)
          resolve(null)
        })
      })
    } catch (error) {
      console.error('Failed to extract video thumbnail:', error)
      return null
    }
  }

  /**
   * 终止 FFmpeg 进程（如果需要）
   */
  terminateProcess(child: any): void {
    if (child && !child.killed) {
      try {
        child.kill('SIGTERM')
        // 等待一段时间，如果还没结束就强制终止
        setTimeout(() => {
          if (child && !child.killed) {
            child.kill('SIGKILL')
          }
        }, 1000)
      } catch (error) {
        console.error('Failed to terminate FFmpeg process:', error)
      }
    }
  }
}

export const ffmpegUtils = new FfmpegUtils()
