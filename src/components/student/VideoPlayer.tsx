'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
  autoOpen?: boolean
  onClose?: () => void
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function VideoPlayer({ url, title, className, autoOpen, onClose }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(autoOpen ?? false)
  const youtubeId = getYouTubeId(url)
  const isYouTube = !!youtubeId

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 text-sm text-[#ff8e80] hover:text-[#fe7e90] transition-colors ${className || ''}`}
      >
        <div className="w-8 h-8 rounded-full gradient-cta flex items-center justify-center">
          <Play size={14} className="text-white ml-0.5" />
        </div>
        <span className="font-semibold uppercase tracking-wider text-xs">Ver Execucao</span>
      </button>
    )
  }

  return (
    <div className="relative bg-[#131313] rounded-md overflow-hidden">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>

      {isYouTube ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title || 'Vídeo do exercício'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          src={url}
          controls
          autoPlay
          className="w-full"
          title={title || 'Vídeo do exercício'}
        >
          Seu navegador não suporta vídeos.
        </video>
      )}
    </div>
  )
}
