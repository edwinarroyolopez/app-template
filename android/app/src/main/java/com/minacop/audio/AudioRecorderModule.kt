package com.pulsocop.audio

import android.media.MediaRecorder
import com.facebook.react.bridge.*
import java.io.File

class AudioRecorderModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var recorder: MediaRecorder? = null
    private var outputFile: String? = null

    override fun getName(): String = "AudioRecorder"

    @ReactMethod
    fun start(promise: Promise) {
        try {
            val dir = reactApplicationContext.cacheDir
            val file = File(dir, "operational_cost_${System.currentTimeMillis()}.m4a")
            outputFile = file.absolutePath

            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(outputFile)
                prepare()
                start()
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_ERROR", e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            recorder?.apply {
                stop()
                release()
            }
            recorder = null

            promise.resolve(outputFile)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e)
        }
    }
}
