'use client'

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)

    mediaRecorderRef.current.ondataavailable = e => {
      chunks.current.push(e.data)
    }

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      setAudioUrl(URL.createObjectURL(blob))
      uploadAudio(blob) // ←ここでSupabaseにアップロード✨
      chunks.current = []
    }

    mediaRecorderRef.current.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const uploadAudio = async (blob: Blob) => {
    const filename = `recording_${Date.now()}.webm`
    const { data, error } = await supabase.storage
      .from('minutes') // バケット名が "minutes" ならOK✨
      .upload(filename, blob)

    if (error) {
      alert('アップロード失敗しちゃった💦：' + error.message)
    } else {
      alert('アップロード成功〜！🎉')
      console.log('✅ URL:', data)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎙️ realminutes – 録音アプリ</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? '🔴 停止' : '▶️ 録音開始'}
      </button>
      {audioUrl && (
        <div>
          <h2>🎧 録音結果</h2>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  )
}
