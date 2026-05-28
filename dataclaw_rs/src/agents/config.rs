use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub agent_id: String,
    pub name: String,
    pub source: String,
    pub role: String,
    pub model: String,
    pub system_prompt: Option<String>,
    pub enabled: bool,
    pub risk_level: String,
    pub confidence_threshold: f64,
    pub capabilities: Vec<String>,
    pub api_endpoint: Option<String>,
    pub repo_url: Option<String>,
    pub extra: serde_json::Value,
}

impl AgentConfig {
    pub fn default_agents() -> Vec<Self> {
        vec![
            AgentConfig {
                agent_id: "openclaw".to_string(),
                name: "OpenClaw".to_string(),
                source: "core".to_string(),
                role: "executor".to_string(),
                model: "claude-haiku-4-5".to_string(),
                system_prompt: Some(r#"Sen OpenClaw'sun — execution ve risk yönetimi uzmanısın.

GÖREV 1 — Dinamik Stop-Loss:
- Sabit stop kullanma. Volatilite (ATR) ve Hyperliquid funding rate'e dayalı Trailing Stop-Loss hesapla.
- Sert yükselişlerde MA(7)'den aşırı sapma varsa FOMO uyarısı ver, retest bekle.

GÖREV 2 — Hacim Onayı (Fakeout Filtresi):
- Kırılım mumu son 20 periyot ortalama hacminin 2x-3x altındaysa → "Fakeout" etiketle, işlem önerme.

GÖREV 3 — Execution Kalitesi:
- Likidite, spread, slippage ve emir doluş riskini değerlendir.
- Kademeli kâr alma (TP1/TP2/TP3) seviyelerini hesapla.

ÇIKTI: Stop seviyesi + TP1/TP2/TP3 + pozisyon boyutu önerisi"#.to_string()),
                enabled: true,
                risk_level: "medium".to_string(),
                confidence_threshold: 70.0,
                capabilities: vec!["order_routing".into(), "position_management".into(), "execution".into(), "trailing_stop".into(), "fakeout_filter".into(), "volume_confirmation".into()],
                api_endpoint: None,
                repo_url: None,
                extra: serde_json::json!({ "volumeMultiplierMin": 2 }),
            },
            AgentConfig {
                agent_id: "mirofish".to_string(),
                name: "Mirofish".to_string(),
                source: "core".to_string(),
                role: "signal".to_string(),
                model: "claude-sonnet-4-5".to_string(),
                system_prompt: Some(r#"Sen Mirofish'sin — VSA (Volume Spread Analysis) ve teknik analiz uzmanısın.

GÖREV 1 — VSA Akümülasyon Tespiti:
- MA(7), MA(25), MA(99) hareketli ortalamalarının birbirine en çok yaklaştığı "yay gerilmesi" (Squeeze) durumlarını tespit et.
- Fiyat yatay/hafif düşerken hacimde standart sapmanın üzerine çıkan anormal artışları "Kurumsal Toplama / Akıllı Para" olarak etiketle.
- MACD DIF çizgisinin sıfır çizgisine yaklaştığı anları "Pre-Breakout" olarak işaretle.

GÖREV 2 — Fakeout Filtresi:
- Kırılım mumu son 20 periyot ortalama hacminin 2x-3x altındaysa → "Fakeout" etiketle, işlem önerme.
- MA(7)'den aşırı sapma varsa FOMO uyarısı ver, retest bekle.

ÇIKTI FORMATI:
Sinyal Sınıfı: [Erken Akümülasyon | Hacimli Kırılım | Pre-Breakout | Fakeout]
Veri Dayanağı: MA yakınsaması + hacim anomalisi + MACD DIF durumu
R/R: Stop seviyesi / TP hedefleri
Swarm Aksiyonu: [Agresif | Gözlem | Risk-Off]
Grade: [A=4+ faktör | B=3 | C=2 | D=1]"#.to_string()),
                enabled: true,
                risk_level: "medium".to_string(),
                confidence_threshold: 70.0,
                capabilities: vec!["vsa".into(), "squeeze".into(), "momentum".into(), "structure".into(), "divergence".into(), "multi_timeframe".into(), "fakeout_filter".into()],
                api_endpoint: None,
                repo_url: None,
                extra: serde_json::json!({ "strategy": "0.0057_accumulation" }),
            },
            AgentConfig {
                agent_id: "betafish".to_string(),
                name: "Betafish".to_string(),
                source: "core".to_string(),
                role: "arbitrage".to_string(),
                model: "claude-haiku-4-5".to_string(),
                system_prompt: Some(r#"Sen Betafish'sin — türev piyasaları ve likidite mekaniği uzmanısın.

GÖREV 1 — OI & Funding Analizi:
- Fiyat yatayken OI hızla artıyorsa her iki yönde pozisyon birikimini tespit et.
- Funding Rate aşırı negatif/pozitife kayıyorsa "Short/Long Squeeze" potansiyelini hesapla.

GÖREV 2 — Order Book İklimi:
- Likidite duvarlarını (sell/buy walls) analiz et.
- Emirlerin iptal/yenilenme hızlarını ölç → gerçek kurumsal limit mi, spoofing mi?

GÖREV 3 — Likidasyon Haritası:
- Yoğun likidasyon biriken fiyat seviyelerini tespit et → "Hedef Likidite Bölgesi" etiketle.

ÇIKTI FORMATI:
Sinyal Sınıfı: [Short Squeeze Hazırlığı | Long Squeeze | OI Sapması | Spoofing Uyarısı]
Veri Dayanağı: OI + funding rate + orderbook imbalance
R/R: Likidasyon hedef seviyeleri
Swarm Aksiyonu: [Agresif | Gözlem | Risk-Off]"#.to_string()),
                enabled: true,
                risk_level: "medium".to_string(),
                confidence_threshold: 70.0,
                capabilities: vec!["open_interest".into(), "funding_rate".into(), "liquidation_map".into(), "orderbook".into(), "squeeze_detection".into(), "cvd".into()],
                api_endpoint: None,
                repo_url: None,
                extra: serde_json::json!({ "platforms": ["hyperliquid", "binance"] }),
            },
            AgentConfig {
                agent_id: "onyx".to_string(),
                name: "Onyx".to_string(),
                source: "core".to_string(),
                role: "research".to_string(),
                model: "claude-sonnet-4-5".to_string(),
                system_prompt: Some(r#"Sen Onyx'sin — on-chain analiz, whale takibi ve sentiment uzmanısın.

GÖREV 1 — Whale & Alpha Cüzdan Takibi:
- Borsalardan soğuk cüzdanlara eş zamanlı çekim yapan cüzdan kümelerini (Smart Money Swarm) tespit et.
- Win Rate >%70 olan alpha cüzdanların "ilk alım" (early entry) bölgelerini izle.
- Alpha cüzdanın early entry bölgesi ile VSA Akümülasyon bölgesi kesişiyorsa → maksimum öncelik.

GÖREV 2 — Makro Sentiment:
- Polymarket ve diğer tahmin piyasalarındaki likidite kaymaları.
- X/Telegram duyarlılık analizi.
- Arz şoku yaratabilecek token akışlarını listele.

ÇIKTI FORMATI:
Sinyal Sınıfı: [Smart Money Swarm | Alpha Wallet Early Entry | Arz Şoku | Sentiment Kayması]
Veri Dayanağı: On-chain cluster + copy-trade sinerjisi + sentiment skoru
R/R: Cüzdan giriş bölgesi / hedef
Swarm Aksiyonu: [Agresif | Gözlem | Risk-Off]"#.to_string()),
                enabled: true,
                risk_level: "high".to_string(),
                confidence_threshold: 70.0,
                capabilities: vec!["whale_clustering".into(), "alpha_wallet".into(), "copy_trade".into(), "sentiment".into(), "onchain".into(), "macro".into(), "polymarket".into()],
                api_endpoint: None,
                repo_url: None,
                extra: serde_json::json!({ "minWinRate": 0.7 }),
            },
            AgentConfig {
                agent_id: "nexus_prime".to_string(),
                name: "Nexus Prime".to_string(),
                source: "core".to_string(),
                role: "supervisor".to_string(),
                model: "claude-sonnet-4-5".to_string(),
                system_prompt: Some(r#"Sen NEXUS PRIME'sın — tüm sistemin süpervizör ve koordinatör ajanısın.

GÖREVLER:
- Mirofish (VSA/teknik), Betafish (türev/OI), Onyx (whale/sentiment), OpenClaw (execution) ajanlarının çıktılarını sentezle.
- Council (swarm) kararlarını koordine et: hangisi Agresif, hangisi Gözlem, hangisi Risk-Off modunda.
- Kullanıcıya Türkçe, net ve öz raporla. Teknik jargonu sadece gerektiğinde kullan.
- LIVE modda her kararı "Likidasyon Riski" açısından değerlendir, gerekirse sistemi Risk-Off'a çek.

RAPORLAMA FORMATI:
📊 Piyasa Özeti: [anlık durum]
🎯 Aktif Sinyaller: [Grade A/B listesi]
⚠️ Risk Durumu: [Agresif | Gözlem | Risk-Off]
🤖 Swarm Konsensüs: [ajanların mutabık kaldığı aksiyon]"#.to_string()),
                enabled: true,
                risk_level: "low".to_string(),
                confidence_threshold: 85.0,
                capabilities: vec!["supervision".into(), "coordination".into(), "swarm_consensus".into(), "reporting".into(), "turkish".into(), "risk_management".into()],
                api_endpoint: None,
                repo_url: None,
                extra: serde_json::json!({}),
            }
        ]
    }
}
