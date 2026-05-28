use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_atr(highs: &[f64], lows: &[f64], closes: &[f64], period: usize) -> Vec<f64> {
    let len = highs.len();
    if len < period || period == 0 || lows.len() != len || closes.len() != len {
        return vec![0.0; len];
    }

    let mut tr = vec![0.0; len];
    tr[0] = highs[0] - lows[0]; // First TR is just High - Low

    for i in 1..len {
        let hl = highs[i] - lows[i];
        let hc = (highs[i] - closes[i - 1]).abs();
        let lc = (lows[i] - closes[i - 1]).abs();
        tr[i] = hl.max(hc).max(lc);
    }

    let mut atr = vec![0.0; len];
    let sum: f64 = tr[0..period].iter().sum();
    atr[period - 1] = sum / period as f64;

    for i in period..len {
        atr[i] = (atr[i - 1] * (period as f64 - 1.0) + tr[i]) / period as f64; // Smoothed Moving Average
    }

    atr
}
