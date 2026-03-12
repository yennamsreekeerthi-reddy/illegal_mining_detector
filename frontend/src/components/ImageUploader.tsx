import { type FormEvent, useEffect, useState } from 'react'

interface ImageUploaderProps {
  onAnalyze: (file: File) => Promise<void>
  loading: boolean
}

function ImageUploader({ onAnalyze, loading }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFile || loading) {
      return
    }

    await onAnalyze(selectedFile)
  }

  return (
    <section className="rounded-2xl bg-panel/90 p-6 shadow-glow backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-slate-100">Upload Satellite Image</h2>
      <p className="mt-2 text-sm text-slate-300">
        Choose a high-resolution satellite image to analyze mining disturbance patterns.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-900/40 px-4 py-8 text-center hover:border-cyan-400">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <span className="text-sm text-slate-300">
            {selectedFile ? selectedFile.name : 'Click to select image'}
          </span>
        </label>

        {previewUrl && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Image preview</p>
            <img
              src={previewUrl}
              alt="Satellite preview"
              className="max-h-72 w-full rounded-xl border border-slate-700 object-contain"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || loading}
          className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>
    </section>
  )
}

export default ImageUploader
