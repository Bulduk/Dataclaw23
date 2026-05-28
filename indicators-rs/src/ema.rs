use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_ema(prices: &[f64], period: usize) -> Vec<f64> {
    if prices.len() < period || period == 0 {
        return vec![0.0; prices.len()];
    }

    let mut ema = vec![0.0; prices.len()];
    let k = 2.0 / (period as f64 + 1.0);
    
    // Start with SMA for the first EMA value
    let sum: f64 = prices[0..period].iter().sum();
    ema[period - 1] = sum / period as f64;

    for i in period..prices.len() {
        ema[i] = (prices[i] - ema[i - 1]) * k + ema[i - 1];
    }

    ema
}
