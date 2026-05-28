use wasm_bindgen::prelude::*;
use crate::sma::calculate_sma;

#[wasm_bindgen(getter_with_clone)]
pub struct BollingerBands {
    pub upper: Vec<f64>,
    pub middle: Vec<f64>,
    pub lower: Vec<f64>,
}

#[wasm_bindgen]
pub fn calculate_bollinger_bands(prices: &[f64], period: usize, std_dev_mult: f64) -> BollingerBands {
    if prices.len() < period || period == 0 {
         return BollingerBands {
            upper: vec![0.0; prices.len()],
            middle: vec![0.0; prices.len()],
            lower: vec![0.0; prices.len()],
        };
    }

    let middle = calculate_sma(prices, period);
    let mut upper = vec![0.0; prices.len()];
    let mut lower = vec![0.0; prices.len()];

    for i in (period - 1)..prices.len() {
        let mean = middle[i];
        let mut variance_sum = 0.0;
        
        for j in 0..period {
            let diff = prices[i - j] - mean;
            variance_sum += diff * diff;
        }
        
        let variance = variance_sum / period as f64;
        let std_dev = variance.sqrt();
        
        upper[i] = mean + (std_dev * std_dev_mult);
        lower[i] = mean - (std_dev * std_dev_mult);
    }

    BollingerBands { upper, middle, lower }
}
