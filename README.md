# Mood Çarkı 🎡

İnteraktif bir mood (ruh hali) çarkı uygulaması. Next.js ile geliştirilmiş modern bir web uygulaması.

## 📋 Özellikler

- 🎨 **Modern ve Şık Tasarım**: Gradient arka plan, animasyonlu dekoratif elementler ve parıldayan efektler
- 🎵 **Ses Efektleri**: Dönme, tık ve çarpma sesleri ile gerçekçi bir deneyim
- 📱 **Responsive Tasarım**: Mobil ve masaüstü cihazlarda mükemmel çalışır
- ⚡ **Smooth Animasyonlar**: CSS transitions ve easing fonksiyonları ile akıcı dönüş animasyonları
- 🎯 **52 Farklı Mood**: Ruhsuz, Mutlu, Enerjik, Şanslı ve daha fazlası!
- ♿ **Erişilebilirlik**: Klavye navigasyonu ve ARIA etiketleri ile desteklenir
- ⚛️ **Next.js 14**: App Router ile modern React yapısı
- 🚀 **Optimize Edilmiş**: Next.js Image optimizasyonu ve performans iyileştirmeleri

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18+ ve npm/yarn/pnpm

### Kurulum

1. Projeyi klonlayın veya indirin:
```bash
cd picksoftdev-mood-felek-ef24c940667e
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

4. Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

### Production Build

Production için build almak için:

```bash
npm run build
npm start
```

## 🎮 Kullanım

1. Çarkı tıklayın veya dokunun
2. Çark dönmeye başlar ve rastgele bir mood seçer
3. Sonuç ekranda popup olarak gösterilir
4. Tekrar çevirmek için çarkı tekrar tıklayın

### Klavye Kullanımı

- `Enter` veya `Space` tuşu ile çarkı çevirebilirsiniz
- Çark odaklanabilir bir elementtir (tab ile seçilebilir)

## 📁 Proje Yapısı

```
picksoftdev-mood-felek-ef24c940667e/
├── app/
│   ├── layout.js          # Root layout (metadata, HTML yapısı)
│   ├── page.js            # Ana sayfa
│   └── globals.css        # Global stiller
├── components/
│   └── Wheel.js           # Ana çark componenti (React)
├── public/
│   └── wheel.png          # Çark görseli
├── package.json           # NPM bağımlılıkları
├── next.config.js         # Next.js konfigürasyonu
├── jsconfig.json          # JavaScript path alias'ları
└── README.md              # Bu dosya
```

## 🛠️ Teknolojiler

- **Next.js 14**: React framework (App Router)
- **React 18**: UI kütüphanesi
- **CSS3**: Modern styling, animations, gradients
- **Web Audio API**: Ses efektleri için
- **Next.js Image**: Optimize edilmiş görsel yükleme

## 🎨 Özelleştirme

### Mood Listesini Değiştirme

`components/Wheel.js` dosyasındaki `MOODS` dizisini düzenleyerek mood seçeneklerini değiştirebilirsiniz:

```javascript
const MOODS = [
  "Ruhsuz",
  "Stresli",
  // ... diğer mood'lar
]
```

### Animasyon Süresini Ayarlama

`components/Wheel.js` dosyasında `SPIN_RANGE` ve `duration` değerlerini değiştirerek dönüş süresini ayarlayabilirsiniz:

```javascript
const SPIN_RANGE = { min: 4, max: 7 } // Tam tur sayısı
const duration = 3200 + randInt(0, 650) // Milisaniye cinsinden
```

### Renkleri Değiştirme

`app/globals.css` dosyasındaki renk değerlerini düzenleyerek tema renklerini değiştirebilirsiniz.

## 📝 Notlar

- Ses efektleri için tarayıcı izni gerekebilir (ilk etkileşimde otomatik olarak açılır)
- Çark görseli (`wheel.png`) 52 eşit dilime bölünmüş olmalıdır
- Mobil cihazlarda dokunmatik etkileşimler optimize edilmiştir
- Next.js Image component'i kullanıldığı için görsel otomatik olarak optimize edilir

## 🌟 Özellikler Detayı

### Ses Sistemi

- **Dönme Sesi**: Çark dönerken çalan düşük frekanslı sawtooth dalga
- **Tık Sesi**: Her dilim geçişinde çalan kısa, keskin sesler
- **Çarpma Sesi**: Çark durduğunda çalan impact sesi

### Animasyonlar

- Çark dönüş animasyonu (cubic-bezier easing)
- Pointer pulse animasyonu
- Dekoratif elementlerin parıldama animasyonları
- Sonuç popup'ının giriş animasyonu

### React Özellikleri

- `useState` ve `useRef` hook'ları ile state yönetimi
- `useEffect` ile lifecycle yönetimi
- Client Component (`'use client'`) ile browser API'leri kullanımı
- Next.js Image component ile optimize edilmiş görsel yükleme

## 🚀 Deployment

### Vercel (Önerilen)

1. GitHub'a push edin
2. [Vercel](https://vercel.com) hesabınızla giriş yapın
3. Projeyi import edin
4. Otomatik olarak deploy edilecektir

### Diğer Platformlar

Next.js uygulaması herhangi bir Node.js destekleyen platformda çalışabilir:
- Netlify
- AWS Amplify
- Railway
- Heroku

## 📄 Lisans

Bu proje eğitim ve kişisel kullanım amaçlıdır.

## 👨‍💻 Geliştirici

PickSoft Development

---

**Eğlenceli kullanımlar! 🎉**
