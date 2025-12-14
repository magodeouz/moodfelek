'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const MOODS = [
  "Rüküş",
  "Stresli",
  "Üşümüş",
  "Agresif",
  "Bomba gibi",
  "Darmadağın",
  "Enerjik",
  "Havalı",
  "İncinmiş",
  "Mutlu",
  "Şanslı",
  "Şapşik",
  "Ağlak",
  "Çalışkan",
  "Deli gibi",
  "Farketmez",
  "Hayalperest",
  "İyi",
  "Özgür",
  "Sexy",
  "Şirin",
  "Yalnız",
  "Aşık",
  "Çapkın",
  "Dengesiz",
  "Hangover",
  "Heyecanlı",
  "Kararsız",
  "Pamuk gibi",
  "Sıcaklamış",
  "Umutlu",
  "Yıkık",
  "Bir şey eksik",
  "Çekici",
  "Düşünceli",
  "Harika",
  "Huzurlu",
  "Loser",
  "Paragöz",
  "Standart",
  "Uykusuz",
  "Yorgun",
  "Bok gibi",
  "Çılgın",
  "Eh işte",
  "Hasta",
  "İç Güveysinden Hallice",
  "Minnoş"
]

const SLICE_ANGLE = 360 / MOODS.length
const ARTWORK_OFFSET = 4
const SPIN_RANGE = { min: 4, max: 7 }
const EASING = "cubic-bezier(0.12, 0.2, 0.03, 1)"

const MOOD_SLUG_MAP = {
  "Rüküş": "rukus",
  "Hayalperest": "hayalperest",
}

export default function Wheel() {
  const wheelRef = useRef(null)
  const wheelShellRef = useRef(null)
  const resultPopupRef = useRef(null)
  const popupTimeoutRef = useRef(null)
  
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [resultImageSrc, setResultImageSrc] = useState('')
  const [resultImageError, setResultImageError] = useState(false)
  
  const currentRotationRef = useRef(0)
  const spinSoundOscillatorRef = useRef(null)
  const spinSoundGainRef = useRef(null)
  const tickIntervalRef = useRef(null)
  const audioContextRef = useRef(null)
  const dragStartRef = useRef(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    // Initialize AudioContext
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext()
    }

    // Unlock audio on first user gesture
    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("touchstart", unlockAudio)
    }
    
    window.addEventListener("pointerdown", unlockAudio, { passive: true })
    window.addEventListener("touchstart", unlockAudio, { passive: true })

    // Prevent scroll keys
    const preventScrollKeys = (e) => {
      const keys = ["ArrowUp", "ArrowDown", "Space", " "]
      if (keys.includes(e.key)) {
        e.preventDefault()
      }
    }
    
    document.addEventListener("keydown", preventScrollKeys, { passive: false })

    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("touchstart", unlockAudio)
      document.removeEventListener("keydown", preventScrollKeys)
      if (tickIntervalRef.current) {
        clearTimeout(tickIntervalRef.current)
      }
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current)
        popupTimeoutRef.current = null
      }
    }
  }, [])

  const rand = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1)
      window.crypto.getRandomValues(buf)
      return buf[0] / 0xffffffff
    }
    return Math.random()
  }

  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min

  const normalizeDeg = (deg) => ((deg % 360) + 360) % 360

  const getCurrentRotationDeg = () => {
    if (!wheelRef.current) return 0
    const style = window.getComputedStyle(wheelRef.current)
    const transform = style.transform || style.webkitTransform
    if (!transform || transform === "none") return 0
    const values = transform.match(/matrix\(([^)]+)\)/)
    if (!values) return 0
    const parts = values[1].split(",").map(Number)
    if (parts.length < 4) return 0
    const [a, b] = parts
    const angle = Math.atan2(b, a) * (180 / Math.PI)
    return angle
  }

  const getPointerAngle = (rotationDeg) => {
    const normalized = normalizeDeg(rotationDeg)
    return (360 - normalized) % 360
  }

  const computeLandedIndex = (rotationDeg) => {
    const pointerAngle = (getPointerAngle(rotationDeg) - ARTWORK_OFFSET + 360 + 1e-6) % 360
    return Math.floor(pointerAngle / SLICE_ANGLE) % MOODS.length
  }

  const computeTargetRotation = (targetIndex, direction = 1) => {
    const targetCenter = ARTWORK_OFFSET + targetIndex * SLICE_ANGLE + SLICE_ANGLE / 2
    const fullTurns = randInt(SPIN_RANGE.min, SPIN_RANGE.max) * 360 * direction
    const normalizedCurrent = normalizeDeg(currentRotationRef.current)
    const targetRotationMod = (360 - targetCenter) % 360
    
    // Calculate the shortest path to target considering direction
    let angleDiff = (targetRotationMod - normalizedCurrent + 360) % 360
    if (angleDiff > 180) angleDiff -= 360
    
    // If direction is negative (counterclockwise), we might need to go the long way
    if (direction < 0 && angleDiff > 0) {
      angleDiff = angleDiff - 360
    } else if (direction > 0 && angleDiff < 0) {
      angleDiff = angleDiff + 360
    }
    
    return currentRotationRef.current + fullTurns + angleDiff
  }

  const playSpinSound = (duration) => {
    if (!audioContextRef.current) return
    
    const osc = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()
    
    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(120, audioContextRef.current.currentTime)
    osc.frequency.exponentialRampToValueAtTime(60, audioContextRef.current.currentTime + duration)
    
    const now = audioContextRef.current.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.15)
    gain.gain.setValueAtTime(0.12, now + duration * 0.6)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    
    osc.connect(gain).connect(audioContextRef.current.destination)
    
    osc.start(now)
    osc.stop(now + duration)
    
    spinSoundOscillatorRef.current = osc
    spinSoundGainRef.current = gain
  }

  const stopSpinSound = () => {
    if (spinSoundGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      spinSoundGainRef.current.gain.cancelScheduledValues(now)
      spinSoundGainRef.current.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      if (spinSoundOscillatorRef.current) {
        spinSoundOscillatorRef.current.stop(now + 0.2)
      }
      spinSoundOscillatorRef.current = null
      spinSoundGainRef.current = null
    }
    if (tickIntervalRef.current) {
      clearTimeout(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
  }

  const playTickSound = () => {
    if (!audioContextRef.current) return
    const osc = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()
    
    osc.type = "square"
    osc.frequency.value = 600
    
    const now = audioContextRef.current.currentTime
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    
    osc.connect(gain).connect(audioContextRef.current.destination)
    osc.start(now)
    osc.stop(now + 0.08)
  }

  const startTickSounds = (duration) => {
    if (!audioContextRef.current) return
    
    playTickSound()
    
    let elapsed = 0
    const startInterval = 80
    const endInterval = 200
    const totalDuration = duration * 1000
    
    const scheduleNextTick = () => {
      if (elapsed >= totalDuration) {
        tickIntervalRef.current = null
        return
      }
      
      const progress = elapsed / totalDuration
      const currentInterval = startInterval + (endInterval - startInterval) * progress
      
      tickIntervalRef.current = setTimeout(() => {
        playTickSound()
        elapsed += currentInterval
        scheduleNextTick()
      }, currentInterval)
    }
    
    scheduleNextTick()
  }

  const playImpact = () => {
    if (!audioContextRef.current) return
    const osc = audioContextRef.current.createOscillator()
    const gain = audioContextRef.current.createGain()
    osc.type = "sine"
    osc.frequency.value = 420
    gain.gain.setValueAtTime(0.0, audioContextRef.current.currentTime)
    gain.gain.linearRampToValueAtTime(0.18, audioContextRef.current.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.35)
    osc.connect(gain).connect(audioContextRef.current.destination)
    osc.start()
    osc.stop(audioContextRef.current.currentTime + 0.4)
  }

  const slugifyMood = (mood) => {
    if (!mood) return ''
    // Use explicit map first to avoid any unexpected transliteration issues
    if (MOOD_SLUG_MAP[mood]) return MOOD_SLUG_MAP[mood]
    
    return mood
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }

  const getMoodImageSrc = (mood) => {
    const slug = slugifyMood(mood)
    if (!slug) return ''
    return `/moods/${slug}.png`
  }

  const updateResult = (text) => {
    setResult(text)
    setResultImageSrc(getMoodImageSrc(text))
    setResultImageError(false)
    setShowResult(true)

    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current)
    }
    popupTimeoutRef.current = setTimeout(() => {
      setShowResult(false)
      popupTimeoutRef.current = null
    }, 3000)
  }

  const startSpin = (direction = 1) => {
    if (isSpinning || !wheelRef.current || !wheelShellRef.current) return
    
    setIsSpinning(true)
    if (wheelShellRef.current) {
      wheelShellRef.current.classList.add("is-spinning")
    }

    currentRotationRef.current = getCurrentRotationDeg()
    const targetIndex = randInt(0, MOODS.length - 1)
    const targetRotation = computeTargetRotation(targetIndex, direction)
    const snappedRotation = normalizeDeg(targetRotation)
    // Spin hızını biraz yavaşlatmak için süreyi uzat
    const duration = 4000 + randInt(400, 900)

    startTickSounds(duration / 1000)

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${duration}ms ${EASING}`
      wheelRef.current.style.transform = `rotate(${targetRotation}deg)`
      wheelRef.current.dataset.targetIndex = String(targetIndex)
    }
    currentRotationRef.current = snappedRotation

    const handleTransitionEnd = () => {
      if (!wheelRef.current) return
      
      requestAnimationFrame(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = "none"
          wheelRef.current.style.transform = `rotate(${snappedRotation}deg)`
          void wheelRef.current.offsetWidth
        }
      })

      stopSpinSound()
      
      const landedIndex = computeLandedIndex(snappedRotation)
      const mood = MOODS[landedIndex]
      updateResult(mood)
      setIsSpinning(false)
      if (wheelShellRef.current) {
        wheelShellRef.current.classList.remove("is-spinning")
      }
      playImpact()
    }

    if (wheelRef.current) {
      wheelRef.current.addEventListener("transitionend", handleTransitionEnd, { once: true })
    }
  }

  const handleKeyDown = (e) => {
    if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault()
      startSpin()
    }
  }

  const getAngleFromCenter = (clientX, clientY, element) => {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI)
  }

  const handlePointerStart = (e) => {
    if (isSpinning || !wheelShellRef.current) return
    
    e.preventDefault()
    isDraggingRef.current = true
    const angle = getAngleFromCenter(e.clientX, e.clientY, wheelShellRef.current)
    dragStartRef.current = { x: e.clientX, y: e.clientY, angle }
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !wheelShellRef.current) return
    e.preventDefault()
  }

  const handlePointerEnd = (e) => {
    if (!isDraggingRef.current || !wheelShellRef.current) return
    
    e.preventDefault()
    isDraggingRef.current = false
    
    if (!dragStartRef.current) return
    
    const startAngle = dragStartRef.current.angle
    const endAngle = getAngleFromCenter(e.clientX, e.clientY, wheelShellRef.current)
    
    // Calculate angular difference
    let angleDiff = endAngle - startAngle
    if (angleDiff > 180) angleDiff -= 360
    if (angleDiff < -180) angleDiff += 360
    
    // Determine direction: positive = clockwise, negative = counterclockwise.
    // angleDiff > 0 means drag moved clockwise (screen coords); spin with drag.
    const direction = angleDiff > 0 ? -1 : 1
    
    // Only trigger if there was significant movement (at least 10 degrees)
    if (Math.abs(angleDiff) > 10) {
      startSpin(direction)
    }
    
    dragStartRef.current = null
  }

  return (
    <div className="app">
      <div className="brand">
        <Image
          src="/brew-logo.png"
          alt="Brew Mood Coffee Tea"
          width={80}
          height={80}
          className="brand__logo"
          priority
        />
        <h1 className="brand__title">Adına Göre Değil Moduna Göre Kahve!</h1>
      </div>

      <div
        ref={wheelShellRef}
        className="wheel-shell"
        role="button"
        aria-label="Mood çarkını çevir"
        tabIndex={0}
        onPointerDown={handlePointerStart}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div className="pointer" aria-hidden="true"></div>
        <div ref={wheelRef} className="wheel">
          <Image
            src="/wheel.png"
            alt="Mood çarkı"
            width={650}
            height={650}
            priority
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>
      </div>

      <div
        ref={resultPopupRef}
        className={`result-popup ${showResult ? 'is-visible' : 'is-hiding'}`}
        aria-live="polite"
      >
        <div className="result-popup__content">
          {resultImageSrc && !resultImageError && (
            <Image
              src={resultImageSrc}
              alt={`${result} görseli`}
              width={260}
              height={260}
              unoptimized
              className="result-popup__image"
              onError={() => setResultImageError(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

