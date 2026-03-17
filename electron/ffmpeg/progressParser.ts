export interface FFmpegProgress {
  frame?: number
  fps?: number
  bitrate?: string
  time?: string
  speed?: string
  percent?: number
}

export function parseProgress(line: string): FFmpegProgress | null {

  const frame = /frame=\s*(\d+)/.exec(line)
  const fps = /fps=\s*(\d+)/.exec(line)
  const time = /time=(\d+:\d+:\d+\.\d+)/.exec(line)
  const bitrate = /bitrate=\s*([^\s]+)/.exec(line)
  const speed = /speed=\s*([^\s]+)/.exec(line)

  if (!frame && !time) return null

  return {
    frame: frame ? Number(frame[1]) : undefined,
    fps: fps ? Number(fps[1]) : undefined,
    time: time ? time[1] : undefined,
    bitrate: bitrate ? bitrate[1] : undefined,
    speed: speed ? speed[1] : undefined
  }
}

export function timeToSeconds(time: string): number {

  const parts = time.split(":").map(Number)

  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}