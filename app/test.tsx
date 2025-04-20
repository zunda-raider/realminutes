'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [files, setFiles] = useState<{ name: string, url: string }[]>([])

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(setFiles)
  }, [])

  return (
    <div>
      <h1>🔍 Supabaseファイル一覧</h1>
      <ul>
        {files.map((file, i) => (
          <li key={i}>
            <a href={file.url} target="_blank">{file.name}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
