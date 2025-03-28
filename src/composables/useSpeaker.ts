import { ref } from 'vue'

interface SpeakOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useSpeaker(defaultOptions: SpeakOptions = {}) {
  const isPlaying = ref(false)
  const synth = window.speechSynthesis
  let currentUtterance: SpeechSynthesisUtterance | null = null

  const defaultConfig: SpeakOptions = {
    lang: defaultOptions.lang || 'en-US',
    rate: defaultOptions.rate || 0.9,
    pitch: defaultOptions.pitch || 1,
    volume: defaultOptions.volume || 1
  }

  const stop = () => {
    if (isPlaying.value) {
      synth.cancel()
      isPlaying.value = false
    }
  }

  const speak = (text: string, options?: SpeakOptions) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Stop any ongoing speech
        stop()

        const utterance = new SpeechSynthesisUtterance(text)
        currentUtterance = utterance

        // Apply configuration
        const config = { ...defaultConfig, ...options }
        utterance.lang = config.lang || 'en-US'
        utterance.rate = config.rate || 0.9
        utterance.pitch = config.pitch || 1
        utterance.volume = config.volume || 1

        // Event handlers
        utterance.onstart = () => {
          isPlaying.value = true
        }

        utterance.onend = () => {
          isPlaying.value = false
          currentUtterance = null
          resolve()
        }

        utterance.onerror = (event) => {
          isPlaying.value = false
          currentUtterance = null
          reject(event)
        }

        // Start speaking
        synth.speak(utterance)

      } catch (error) {
        isPlaying.value = false
        currentUtterance = null
        reject(error)
      }
    })
  }

  const pause = () => {
    if (isPlaying.value) {
      synth.pause()
    }
  }

  const resume = () => {
    if (currentUtterance) {
      synth.resume()
    }
  }

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying
  }
}