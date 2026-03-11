import { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi'

export default function ImageGallery({ images = [], destination }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(null)

  if (!images.length) return (
    <div className="glass-card p-6 text-center text-white/40">
      No images available
    </div>
  )

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  return (
    <>
      {/* Main carousel */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-900 group">
        <img
          src={images[activeIdx]}
          alt={`${destination} - photo ${activeIdx + 1}`}
          className="w-full h-80 object-cover transition-all duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
        
        {/* Controls */}
        <button onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-dark-900/70 hover:bg-dark-900/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100">
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-dark-900/70 hover:bg-dark-900/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100">
          <FiChevronRight className="w-5 h-5" />
        </button>

        {/* Fullscreen */}
        <button onClick={() => setLightbox(images[activeIdx])}
          className="absolute top-3 right-3 bg-dark-900/70 hover:bg-dark-900/90 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100">
          <FiMaximize2 className="w-4 h-4" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-dark-900/70 px-2 py-1 rounded-full text-xs text-white/70">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-6 gap-2 mt-3">
        {images.slice(0, 12).map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`rounded-lg overflow-hidden aspect-square transition-all ${i === activeIdx ? 'ring-2 ring-primary-500 scale-95' : 'opacity-60 hover:opacity-100'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full" onClick={() => setLightbox(null)}>
            <FiX className="w-6 h-6" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
