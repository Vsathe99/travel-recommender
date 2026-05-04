import { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi'

export default function ImageGallery({ images = [], destination }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(null)

  if (!images.length) return (
    <div className="rounded-3xl bg-black/[0.03] p-6 text-center text-[#2d3142]/30 text-sm">No images available</div>
  )

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  return (
    <>
      {/* Main image */}
      <div className="relative rounded-3xl overflow-hidden group" style={{ aspectRatio: '16/10' }}>
        <img src={images[activeIdx]} alt={`${destination} ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Nav arrows */}
        <button onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#2d3142]/70 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all">
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#2d3142]/70 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all">
          <FiChevronRight className="w-5 h-5" />
        </button>

        {/* Fullscreen */}
        <button onClick={() => setLightbox(images[activeIdx])}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#2d3142]/60 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all">
          <FiMaximize2 className="w-4 h-4" />
        </button>

        {/* Counter pill */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-[#2d3142]/60 font-medium">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {images.slice(0, 8).map((img, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            className={`rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${i === activeIdx ? 'ring-2 ring-indigo-500 ring-offset-2 scale-95' : 'opacity-50 hover:opacity-80'}`}
            style={{ width: 64, height: 48 }}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setLightbox(null)}>
            <FiX className="w-5 h-5 text-white" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
