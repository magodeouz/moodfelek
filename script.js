(() => {
  // Dilimler: pointer 12 yönünde, saat yönünde ilerliyor (wheel.png birebir sıra)
  const moods = [
    "Ruhsuz",
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
    "Şaşkın",
    "Şapşik",
    "Ağlak",
    "Çalışkan",
    "Deli gibi",
    "Fark etmez",
    "Havalı prestij",
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
    "Deli gibi",
    "Sıkılmış",
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
  ];

  const wheel = document.getElementById("wheel");
  const wheelShell = document.getElementById("wheelShell");
  const resultValue = document.getElementById("resultValue");
  const resultPopup = document.getElementById("resultPopup");

  const sliceAngle = 360 / moods.length;
  // Görseldeki ilk dilim (Ruhsuz) merkezi için saat yönünde ofset (derece)
  // Negatif değer sonucu bir sonraki dilime kaydırır. Gerekirse ince ayar yap.
  // 2 dilim = 15 derece (7.5 * 2), 2 dilim öncekini gösteriyorsa +15 ekle
  const artworkOffset = 4;
  const spinRange = { min: 4, max: 7 };
  const easing = "cubic-bezier(0.12, 0.2, 0.03, 1)";

  let isSpinning = false;
  let currentRotation = 0;
  let spinSoundOscillator = null;
  let spinSoundGain = null;
  let tickInterval = null;

  // Audio (optional, silent fail if blocked)
  const audioContext = window.AudioContext ? new AudioContext() : null;
  
  const playSpinSound = (duration) => {
    if (!audioContext) return;
    
    // Dönme sesi için düşük frekanslı oscillator
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Ana ton (düşük frekanslı dönme sesi - sawtooth daha gerçekçi)
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, audioContext.currentTime);
    // Çark yavaşlarken frekansı düşür
    osc.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + duration);
    
    // Gain ayarları - başta yüksek, sonra fade out
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
    gain.gain.setValueAtTime(0.12, now + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain).connect(audioContext.destination);
    
    osc.start(now);
    osc.stop(now + duration);
    
    spinSoundOscillator = osc;
    spinSoundGain = gain;
  };
  
  const stopSpinSound = () => {
    if (spinSoundGain && audioContext) {
      const now = audioContext.currentTime;
      spinSoundGain.gain.cancelScheduledValues(now);
      spinSoundGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      if (spinSoundOscillator) {
        spinSoundOscillator.stop(now + 0.2);
      }
      spinSoundOscillator = null;
      spinSoundGain = null;
    }
    if (tickInterval) {
      clearTimeout(tickInterval);
      tickInterval = null;
    }
  };
  
  const playTickSound = () => {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Kısa, keskin tık sesi - mekanik ses için düşük frekans
    osc.type = "square";
    osc.frequency.value = 600;
    
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  };
  
  const startTickSounds = (duration) => {
    if (!audioContext) return;
    
    // İlk tık sesi hemen
    playTickSound();
    
    let elapsed = 0;
    const startInterval = 80;
    const endInterval = 200;
    const totalDuration = duration * 1000;
    
    const scheduleNextTick = () => {
      if (elapsed >= totalDuration) {
        tickInterval = null;
        return;
      }
      
      // Başlangıçta hızlı, sonra yavaşlayarak
      const progress = elapsed / totalDuration;
      const currentInterval = startInterval + (endInterval - startInterval) * progress;
      
      tickInterval = setTimeout(() => {
        playTickSound();
        elapsed += currentInterval;
        scheduleNextTick();
      }, currentInterval);
    };
    
    scheduleNextTick();
  };
  
  const playImpact = () => {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = 420;
    gain.gain.setValueAtTime(0.0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
  };

  const rand = () => {
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] / 0xffffffff;
    }
    return Math.random();
  };

  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

  const normalizeDeg = (deg) => ((deg % 360) + 360) % 360;

  const getCurrentRotationDeg = () => {
    const style = getComputedStyle(wheel);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === "none") return 0;
    const values = transform.match(/matrix\\(([^)]+)\\)/);
    if (!values) return 0;
    const parts = values[1].split(",").map(Number);
    if (parts.length < 4) return 0;
    const [a, b] = parts;
    const angle = Math.atan2(b, a) * (180 / Math.PI);
    return angle;
  };

  const getPointerAngle = (rotationDeg) => {
    const normalized = normalizeDeg(rotationDeg);
    return (360 - normalized) % 360;
  };

  const computeLandedIndex = (rotationDeg) => {
    const pointerAngle = (getPointerAngle(rotationDeg) - artworkOffset + 360 + 1e-6) % 360;
    return Math.floor(pointerAngle / sliceAngle) % moods.length;
  };

  const computeTargetRotation = (targetIndex) => {
    const targetCenter = artworkOffset + targetIndex * sliceAngle + sliceAngle / 2;
    const fullTurns = randInt(spinRange.min, spinRange.max) * 360;
    const normalizedCurrent = normalizeDeg(currentRotation);
    const targetRotationMod = (360 - targetCenter) % 360;
    // Keep angle small by subtracting current modulo, prevents unbounded growth
    return currentRotation + fullTurns + (targetRotationMod - normalizedCurrent);
  };

  const setSpinningState = (active) => {
    isSpinning = active;
    wheelShell.classList.toggle("is-spinning", active);
  };

  const updateResult = (text) => {
    resultValue.textContent = text;
    resultPopup.classList.add("is-visible");
    
    // 2 saniye sonra popup'ı kaldır
    setTimeout(() => {
      resultPopup.classList.remove("is-visible");
    }, 2000);
  };

  const startSpin = () => {
    if (isSpinning) return;
    setSpinningState(true);

    currentRotation = getCurrentRotationDeg();
    const targetIndex = randInt(0, moods.length - 1);
    const targetRotation = computeTargetRotation(targetIndex);
    const snappedRotation = normalizeDeg(targetRotation);
    const duration = 3200 + randInt(0, 650);

    // Tık tık seslerini başlat
    startTickSounds(duration / 1000);

    wheel.style.transition = `transform ${duration}ms ${easing}`;
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    wheel.dataset.targetIndex = String(targetIndex);
    currentRotation = snappedRotation;

    wheel.addEventListener(
      "transitionend",
      () => {
        // Normalize transform to small angle to avoid cumulative float drift
        requestAnimationFrame(() => {
          wheel.style.transition = "none";
          wheel.style.transform = `rotate(${snappedRotation}deg)`;
          // Force reflow to apply immediate snap without flicker
          void wheel.offsetWidth;
        });

        // Dönme sesini durdur
        stopSpinSound();
        
        const landedIndex = computeLandedIndex(snappedRotation);
        const mood = moods[landedIndex];
        updateResult(mood);
        setSpinningState(false);
        playImpact();
      },
      { once: true }
    );
  };

  const preventScrollKeys = (e) => {
    const keys = ["ArrowUp", "ArrowDown", "Space", " "];
    if (keys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const init = () => {
    wheelShell.addEventListener("pointerdown", startSpin, { passive: true });
    wheelShell.addEventListener("keydown", (e) => {
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        startSpin();
      }
    });
    document.addEventListener("keydown", preventScrollKeys, { passive: false });

    // Trigger AudioContext on first user gesture (mobile Safari requirement)
    const unlockAudio = () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });
  };

  document.addEventListener("DOMContentLoaded", init);
})();

