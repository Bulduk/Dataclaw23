use wasm_bindgen::prelude::*;
use crate::ema::calculate_ema;

#[wasm_bindgen(getter_with_clone)]
pub struct MacdResult {
    pub macd: Vec<f64>,
    pub signal: Vec<f64>,
    pub histogram: Vec<f64>,
}

#[wasm_bindgen]
pub fn calculate_macd(prices: &[f64], short_period: usize, long_period: usize, signal_period: usize) -> MacdResult {
    if prices.len() < long_period {
        return MacdResult {
            macd: vec![0.0; prices.len()],
            signal: vec![0.0; prices.len()],
            histogram: vec![0.0; prices.len()],
        };
    }

    let short_ema = calculate_ema(prices, short_period);
    let long_ema = calculate_ema(prices, long_period);

    let mut macd_line = vec![0.0; prices.len()];
    for i in 0..prices.len() {
        if i >= long_period - 1 {
            macd_line[i] = short_ema[i] - long_ema[i];
        }
    }

    let signal_line = calculate_ema(&macd_line, signal_period);
    let mut histogram = vec![0.0; prices.len()];

    for i in 0..prices.len() {
        if i >= long_period - 1 + signal_period - 1 {
            histogram[i] = macd_line[i] - signal_line[i];
        }
    }

    MacdResult {
        macd: macd_line,
        signal: signal_line,
        histogram,
    }
}
