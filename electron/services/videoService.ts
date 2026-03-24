import { FFmpegCommandBuilder } from "../ffmpeg/FFmpegCommandBuilder"
import { FFmpegExecutor } from "../ffmpeg/FFmpegExecutor"
import { FFmpegProgress } from "../ffmpeg/progressParser"

const executor = new FFmpegExecutor()

export interface TranscodeParams {

    input: string
    output: string

    // seek
    seek?: string
    preciseSeek?: boolean

    duration?: string

    video?: {
        codec?: string
        bitrate?: string
        fps?: number
        size?: string
    }

    audio?: {
        codec?: string
        bitrate?: string
    }

    // 图片能力
    watermark?: {
        image: string
        x?: number
        y?: number
        start?: string  // 水印开始时间（秒）
        end?: string    // 水印结束时间（秒）
        size?: number   // 水印大小（百分比，1-100）
    }

    cover?: string

    // metadata
    id3?: {
        title?: string
        artist?: string
        album?: string
    }
}

function applySeek(builder: FFmpegCommandBuilder, p: TranscodeParams) {

    if (!p.seek) return

    if (!p.preciseSeek) {
        builder.seekInput(p.seek)
    } else {
        builder.seekOutput(p.seek)
    }
}

export const videoService = {

    // ========================
    // 转码（完整能力）
    // ========================
    transcode(
        params: TranscodeParams,
        onProgress?: (p: FFmpegProgress) => void
    ) {

        const builder = new FFmpegCommandBuilder()
            .overwrite()
            .input(params.input)

        // seek
        applySeek(builder, params)

        // duration
        if (params.duration) {
            builder.duration(params.duration)
        }

        // watermark
        if (params.watermark) {
            // 确保使用传入的坐标值，如果未定义则使用默认值
            const watermarkX = params.watermark.x !== undefined ? params.watermark.x : 10
            const watermarkY = params.watermark.y !== undefined ? params.watermark.y : 10
            
            console.log('[videoService] Applying watermark with coordinates:', {
                image: params.watermark.image,
                x: watermarkX,
                y: watermarkY,
                start: params.watermark.start,
                end: params.watermark.end,
                size: params.watermark.size
            })
            
            builder.watermark(
                params.watermark.image,
                watermarkX,
                watermarkY,
                params.watermark.start,
                params.watermark.end,
                params.watermark.size
            )
        }

        // video
        if (params.video) {
            if (params.video.codec) builder.videoCodec(params.video.codec)
            if (params.video.bitrate) builder.bitrate(params.video.bitrate)
            if (params.video.fps) builder.fps(params.video.fps)
            if (params.video.size) builder.size(params.video.size)
        }


        // audio
        if (params.audio) {
            if (params.audio.codec) builder.audioCodec(params.audio.codec)
            if (params.audio.bitrate) builder.audioBitrate(params.audio.bitrate)
        }

        // cover（注意要在 codec 之后）
        if (params.cover) {
            builder.attachCover(params.cover)
        }

        // metadata
        if (params.id3) {
            builder.id3(params.id3)
        }

        builder.output(params.output)

        return executor.run(builder.build(), {
            onProgress
        })

    },

    // ========================
    // 截图
    // ========================
    screenshot(input: string, time: string, output: string) {

        const builder = new FFmpegCommandBuilder()
            .input(input)
            .seekInput(time)
            .custom("-vframes", "1")
            .output(output)

        return executor.run(builder.build())

    },

    // ========================
    // 精确截图
    // ========================
    screenshotAccurate(input: string, time: string, output: string) {

        const builder = new FFmpegCommandBuilder()
            .input(input)
            .seekOutput(time)
            .custom("-vframes", "1")
            .output(output)

        return executor.run(builder.build())

    },

    // ========================
    // 裁剪
    // ========================
    cut(
        input: string,
        output: string,
        start: string,
        duration: string,
        precise = false
    ) {

        const builder = new FFmpegCommandBuilder()
            .overwrite()
            .input(input)

        if (!precise) {
            builder.seekInput(start)
        } else {
            builder.seekOutput(start)
        }

        builder
            .duration(duration)
            .output(output)

        return executor.run(builder.build())

    }

}