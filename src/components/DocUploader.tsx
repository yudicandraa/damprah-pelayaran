// src/components/DocUploader.tsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Props = {
  portId: string
  onDone?: () => void
  folder?: string // optional: subfolder in bucket
}

export default function DocUploader({ portId, onDone, folder = '' }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload() {
    if (!file) return alert('Pilih file terlebih dahulu')
    setUploading(true)
    try {
      // bucket name — ganti sesuai bucket di Supabase
      const bucket = 'dokumen-pelabuhan-aceh'
      const filename = `${Date.now()}_${file.name}`
      const path = folder ? `${folder}/${portId}/${filename}` : `${portId}/${filename}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError
      // Simpan metadata ke tabel documents
      const { error: dbErr } = await supabase.from('documents').insert({
        port_id: portId,
        file_name: file.name,
        path: uploadData.path,
        uploaded_by: 'web', // ganti jika pakai Supabase Auth: user.email
      })

      if (dbErr) throw dbErr

      setFile(null)
      onDone?.()
      alert('Upload berhasil')
    } catch (err: any) {
      console.error(err)
      alert('Upload gagal: ' + (err.message ?? String(err)))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      <div className="flex gap-2 items-center">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-3 py-1 rounded bg-sky-600 text-white disabled:opacity-50"
        >
          {uploading ? 'Mengunggah...' : 'Unggah'}
        </button>
        {file && <div className="text-sm text-slate-600">{file.name}</div>}
      </div>
    </div>
  )
}
