# Dataclaw Rust & VSA Modernizasyon Raporu

## Mevcut Sisteme Olan Analiz (Sistem Promptlarına Göre)

Sistem promptları (`Agent Config`) şu an son derece spesifik ve kurumsal bir "Quant/Algo" fonu yönetiyormuş gibi tasarlandı.
- **Mirofish:** Teknik analiz ve Hacim Dağılım Uzmanı (VSA/Squeeze). Hacmi fiyat ile korele ederek tuzakları (fakeout) ayıklıyor.
- **Betafish:** Open Interest ve Funding oranlarını okuyarak türev piyasadaki squeeze (likidasyon) patlamalarını önceden yakalıyor.
- **Onyx:** Onchain Cüzdan takibi - Balina hareketini ve Smart Money'i takip ediyor.
- **OpenClaw:** Risk ve Execution. Kararını veren sürüyü (Swarm) piyasa koşullarına göre koruyor ve duruma göre giriş/çıkış yapıyor.

## Sisteme Daha Fazla Güç Katacak Bileşenler

Şu anki sistem promptlarının kapasitesini `x100` artıracak en kritik eksiklikler şunlardır:

1. **WASM Tabanlı High-Frequency Matematik:** Rust tabanlı yazdığımız `indicators-wasm` paketi, Squeeze/VWAP/ADX gibi karmaşık indikatörlerin Node.js veya yavaş Python arka planında hesaplanmasından çok, **doğrudan tarayıcıda veya VPS'in bellek içinde (0-copy)** milisaniyenin binde biri hızında hesaplanmasını sağlar.

2. **Gerçek Zamanlı Level-2 (L2) Orderbook:** Betafish'in bahsettiği "Spoofing" tespiti ancak saniyede 100+ güncelleme gelen Binance/Bybit WebSocket stream'leriyle ölçülebilir. L2 defterindeki "Yıkılma" (Buy Wall iptalleri) tarama mantığı Rust tarafına taşınmalıdır (Mevcut fazda, UX için API Web Socket arayüzlerini bağladık).

3. **Global Risk Motoru (PolicyGuard):** OpenClaw'ın `Dinamik Stop-Loss` ve `Slippage` kontrolü için yalnızca LLM yeterli değildir; LLM sadece *karar* vermelidir. Execution aşamasında emrin iptal mi edileceği, TWAP mı yapılacağı **Rust tabanlı Smart Router** kararı olmalıdır.

---

## Aşama ve Görev Planı (ROADMAP)

### FAZ 1 (AKTİF): Piyasaları Milisaniyeye Düşürme (Gerçekçi HFT Arayüzü)
- [x] Rust tabanlı WASM Endikatör kütüphanesinin (SMA, EMA, RSI, MACD, ATR, BB) şablonlarının oluşturulması.
- [x] Axum (Rust) sunucu altyapısının VPS standartlarında saniyede on binlerce isteği kaldıracak şekilde ayağa kaldırılması.
- [x] **UI/UX Phemex/Binance Standardı:** React frontend'inde `useRealtimeMarket` WebSocket entegrasyonunun yazılması. `QuantDashboard`'ın doğrudan Binance'den saniyede bir L2 Orderbook ve Fiyat Ticker beslemesi alıp anında render etmesi.

### FAZ 2: VSA ve Betafish "Engine" Entegrasyonu
- **Squeeze & Volume Profiler:** Fiyatın MA yatayında hareket etmesine karşın oluşan hacim barlarının Rust içinde "VSA Divergence" olarak etiketlenmesi.
- **Funding & OI Stream:** Binance Futures kanalından Açık Pozisyon (OI) ve Fonlama verisinin gerçek zamanlı toplanıp *Betafish* promptuna bir bağlam (context window) argümanı olarak saniyede bir sıkıştırılarak gönderilmesi.
- *Etki:* Sinyaller gecikmeli periyotlardan (1m/5m) çıkarak `Tick-bazlı` oluşmaya başlayacaktır.

### FAZ 3: Otonom Risk ve Execution (Zırhlı Sürüm)
- **Rust Execution (Smart Router):** LLM (OpenClaw) "LONG" dediği an, sistem orderbook likiditesine bakar, slippage > 0.1% ise Order'ı parçalar (TWAP).
- **Kill-Switch (Zero Latency):** Portföy "Drawdown" limitini geçtiği 1 milisaniye içerisinde, LLM ve ajanların onayını beklemeden açık olan API soketlerinden `CANCEL ALL` ve `MARKET SELL CLOSE` işlemleri Rust tarafından tetiklenir.

## Sonuç
Ajan promptları piyasanın duygu ve tekniğini okumada muazzam güçlüdür. Bu ajanlardan maksimum verimi almak, onlara "gecikmiş" grafikler sunmak yerine, Rust üzerinden saf matematik veri akışı sunup onlardan sadace "Stratejik Konsensüs" kararı istemek ile mümkündür. 

Şu an UI/UX'i Phemex/Binance hissiyatına getirdik ve gerçek WebSocket bağladık. Sonraki adım Swarm'ı bu real-time L2 verisiyle beslemektir.
