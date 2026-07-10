import { useRef, useEffect, useCallback } from 'react'
import { Globe, ArrowRight, Instagram, Twitter } from 'lucide-react'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const opacityRef = useRef(1)
  const fadingOutRef = useRef(false)
  const animFrameRef = useRef<number | null>(null)

  const cancelAnim = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const fadeIn = useCallback((duration = 500) => {
    cancelAnim()
    fadingOutRef.current = false
    const start = performance.now()
    const startOpacity = opacityRef.current

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      opacityRef.current = startOpacity + (1 - startOpacity) * progress
      if (videoRef.current) {
        videoRef.current.style.opacity = String(opacityRef.current)
      }
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }, [cancelAnim])

  const fadeOut = useCallback((duration = 500) => {
    cancelAnim()
    fadingOutRef.current = true
    const start = performance.now()
    const startOpacity = opacityRef.current

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      opacityRef.current = startOpacity * (1 - progress)
      if (videoRef.current) {
        videoRef.current.style.opacity = String(opacityRef.current)
      }
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }, [cancelAnim])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.55 && !fadingOutRef.current) {
        fadeOut()
      }
    }

    const handleEnded = () => {
      cancelAnim()
      fadingOutRef.current = false
      opacityRef.current = 0
      if (video) video.style.opacity = '0'
      setTimeout(() => {
        if (video) {
          video.currentTime = 0
          video.play()
          fadeIn()
        }
      }, 100)
    }

    const handlePlay = () => {
      if (opacityRef.current < 1) {
        fadeIn()
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)

    return () => {
      cancelAnim()
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
    }
  }, [fadeIn, fadeOut, cancelAnim])

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop={false}
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        style={{ opacity: 1 }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6">
        <div className="rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto liquid-glass">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Globe size={24} className="text-white" />
            <span className="text-white font-semibold text-lg">Asme</span>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</a>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-4">
            <button className="text-white text-sm font-medium">Sign Up</button>
            <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="max-w-xl w-full space-y-4">
          {/* Email Input Bar */}
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none border-none"
            />
            <button className="bg-white rounded-full p-3 text-black flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-white text-sm leading-relaxed px-4">
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          {/* Manifesto Button */}
          <div className="flex justify-center pt-2">
            <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer">
              Manifesto
            </button>
          </div>
        </div>
      </div>

      {/* Social Footer */}
      <div className="relative z-10 flex justify-center gap-4 pb-12">
        <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer" aria-label="Instagram">
          <Instagram size={20} />
        </button>
        <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer" aria-label="Twitter">
          <Twitter size={20} />
        </button>
        <button className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer" aria-label="Globe">
          <Globe size={20} />
        </button>
      </div>
    </div>
  )
}
