use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_rsi(prices: &[f64], period: usize) -> Vec<f64> {
    if prices.len() <= period || period == 0 {
        return vec![0.0; prices.len()];
    }

    let mut rsi = vec![0.0; prices.len()];
    let mut gains = 0.0;
    let mut losses = 0.0;

    for i in 1..=period {
        let diff = prices[i] - prices[i - 1];
        if diff >= 0.0 {
            gains += diff;
        } else {
            losses -= diff;
        }
    }

    let mut avg_gain = gains / period as f64;
    let mut avg_loss = losses / period as f64;

    if avg_loss == 0.0 {
        rsi[period] = 100.0;
    } else {
        let rs = avg_gain / avg_loss;
        rsi[period] = 100.0 - (100.0 / (1.0 + rs));
    }

    for i in (period + 1)..prices.len() {
        let diff = prices[i] - prices[i - 1];
        let mut gain = 0.0;
        let mut loss = 0.0;

        if diff >= 0.0 {
            gain = diff;
        } else {
            loss = -diff;
        }

        avg_gain = (avg_gain * (period as f64 - 1.0) + gain) / period as f64;
        avg_loss = (avg_loss * (period as f64 - 1.0) + loss) / period as f64;

        if avg_loss == 0.0 {
            rsi[i] = 100.0;
        } else {
            let rs = avg_gain / avg_loss;
            rsi[i] = 100.0 - (100.0 / (1.0 + rs));
        }
    }

    rsi
}
