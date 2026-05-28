use wasm_bindgen::prelude::*;
use crate::bollinger::calculate_bollinger_bands;
use crate::sma::calculate_sma;

#[wasm_bindgen]
pub fn calculate_bb_squeeze(prices: &[f64], tr: &[f64], period: usize, bb_mult: f64, kc_mult: f64) -> Vec<bool> {
    if prices.len() < period || tr.len() != prices.len() {
        return vec![false; prices.len()];
    }

    let bb = calculate_bollinger_bands(prices, period, bb_mult);
    let sma = calculate_sma(prices, period);
    
    // Keltner Channels
    let mut kc_upper = vec![0.0; prices.len()];
    let mut kc_lower = vec![0.0; prices.len()];
    
    // Smooth TR for KC
    let mut atr = vec![0.0; prices.len()];
    let sum: f64 = tr[0..period].iter().sum();
    atr[period - 1] = sum / period as f64;
    
    for i in period..prices.len() {
        atr[i] = (atr[i - 1] * (period as f64 - 1.0) + tr[i]) / period as f64;
    }
    
    for i in (period - 1)..prices.len() {
        kc_upper[i] = sma[i] + (atr[i] * kc_mult);
        kc_lower[i] = sma[i] - (atr[i] * kc_mult);
    }
    
    let mut squeeze = vec![false; prices.len()];
    for i in (period - 1)..prices.len() {
        // Squeeze is ON when BB is completely inside KC
        squeeze[i] = bb.upper[i] < kc_upper[i] && bb.lower[i] > kc_lower[i];
    }
    
    squeeze
}
