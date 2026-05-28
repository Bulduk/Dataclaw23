use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_sma(prices: &[f64], period: usize) -> Vec<f64> {
    if prices.len() < period || period == 0 {
        return vec![0.0; prices.len()];
    }

    let mut sma = vec![0.0; prices.len()];
    let mut sum: f64 = prices[0..period].iter().sum();
    sma[period - 1] = sum / period as f64;

    for i in period..prices.len() {
        sum += prices[i] - prices[i - period];
        sma[i] = sum / period as f64;
    }

    sma
}
