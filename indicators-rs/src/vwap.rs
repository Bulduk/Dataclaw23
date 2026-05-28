use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_vwap(highs: &[f64], lows: &[f64], closes: &[f64], volumes: &[f64], _period: usize) -> Vec<f64> {
    // VWAP is typically anchored (e.g. daily, weekly). For simplicity, we calculate cumulative VWAP over the given data slice
    let len = highs.len();
    if len == 0 || lows.len() != len || closes.len() != len || volumes.len() != len {
        return vec![0.0; len];
    }
    
    let mut vwap = vec![0.0; len];
    let mut cum_vol_price = 0.0;
    let mut cum_vol = 0.0;

    for i in 0..len {
        let typical_price = (highs[i] + lows[i] + closes[i]) / 3.0;
        cum_vol_price += typical_price * volumes[i];
        cum_vol += volumes[i];
        
        if cum_vol > 0.0 {
            vwap[i] = cum_vol_price / cum_vol;
        } else {
            vwap[i] = typical_price;
        }
    }
    
    vwap
}
