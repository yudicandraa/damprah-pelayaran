// src/components/DocList.tsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type DocRow = {
  id: number
  port_id: string
  file_name: string
  path: string
  uploaded_at: string
  uploaded_by?: string
}

export default function DocList({ portId }: { portId: string }) {
  const [rows, setRows] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(false)
  const bucket = 'dokumen-pelabuhan-aceh'

useEffect(() => {
  if (!portId) return
  let mounted = true
  setLoading(true)

  ;(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('port_id', portId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error(error)
        if (mounted) setRows([])
        return
      }

      if (mounted) setRows((data ?? []) as DocRow[])
    } catch (err) {
      console.error(err)
      if (mounted) setRows([])
    } finally {
      if (mounted) setLoading(false)
    }
  })()

  return () => {
    mounted = false
  }
}, [portId])


  async function getDownloadUrl(path: string) {
    // jika bucket private: buat signed URL (expire mis. 1 jam)
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60)
    if (error) {
      console.error('signedUrl error', error)
      return null
    }
    return data.signedUrl
  }

  return (
    <div>
      {loading && <div>Memuat dokumen...</div>}
      {!loading && rows.length === 0 && <div className="text-sm text-slate-500">Belum ada dokumen.</div>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 p-2 border rounded">
            <div>
              <div className="font-medium">{r.file_name}</div>
              <div className="text-xs text-slate-500">{new Date(r.uploaded_at).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#download"
                onClick={async (e) => {
                  e.preventDefault()
                  const url = await getDownloadUrl(r.path)
                  if (url) window.open(url, '_blank')
                  else alert('Gagal membuat link download')
                }}
                className="text-sm underline"
              >
                Download
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
