'use client'

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [recording, setRecording] = useState(false)
  const [language, setLanguage] = useState<'ja' | 'en' | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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
      chunks.current = []

      const fileName = `recording_${Date.now()}.webm`
      const upload = async () => {
        const { data, error } = await supabase.storage
          .from('minutes')
          .upload(fileName, blob)

        if (error) {
          alert('アップロード失敗💦: ' + error.message)
        } else {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/minutes/${fileName}`
          setAudioUrl(url)
          alert('アップロード成功🎉')
        }
      }
      upload()
    }

    mediaRecorderRef.current.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleProcess = async () => {
    if (!audioUrl || !language) return alert('音声と使用言語を選んでね〜💦')
    setIsProcessing(true)

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: audioUrl, language })
    })

    const data = await res.json()
    setIsProcessing(false)
    if (data.text) {
      alert('📝 議事録ができたよ！\n\n' + data.text.slice(0, 300) + '...')
    } else {
      alert('💦 処理失敗: ' + data.message)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1> realminutes </h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: recording ? '#ff4d4f' : '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            marginRight: '1rem',
            cursor: 'pointer'
          }}
        >
          {recording ? '🛑 停止' : '🎤 録音開始'}
        </button>

        {audioUrl && <span>✅ アップロード完了！</span>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <span style={{ marginRight: '1rem' }}>🌍 言語を選んでね：</span>
        <button
          onClick={() => setLanguage('ja')}
          style={{
            padding: '0.4rem 1rem',
            backgroundColor: language === 'ja' ? '#52c41a' : '#eee',
            color: language === 'ja' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            marginRight: '0.5rem',
            cursor: 'pointer'
          }}
        >
          日本語
        </button>
        <button
          onClick={() => setLanguage('en')}
          style={{
            padding: '0.4rem 1rem',
            backgroundColor: language === 'en' ? '#52c41a' : '#eee',
            color: language === 'en' ? 'white' : '#333',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          English
        </button>
      </div>

      <div>
        <button
          disabled={!audioUrl || !language || isProcessing}
          onClick={handleProcess}
          style={{
            padding: '0.5rem 1.2rem',
            backgroundColor: isProcessing ? '#ccc' : '#722ed1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? '⏳ 処理中…' : '🪄 議事録を作成！'}
        </button>
      </div>
    </div>
  )
}
