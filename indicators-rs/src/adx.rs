use wasm_bindgen::prelude::*;
use crate::atr::calculate_atr;

#[wasm_bindgen(getter_with_clone)]
pub struct AdxResult {
    pub plus_di: Vec<f64>,
    pub minus_di: Vec<f64>,
    pub adx: Vec<f64>,
}

#[wasm_bindgen]
pub fn calculate_adx(highs: &[f64], lows: &[f64], closes: &[f64], period: usize) -> AdxResult {
    let len = highs.len();
    if len < period * 2 {
         return AdxResult {
            plus_di: vec![0.0; len],
            minus_di: vec![0.0; len],
            adx: vec![0.0; len],
        };
    }

    let mut plus_dm = vec![0.0; len];
    let mut minus_dm = vec![0.0; len];

    for i in 1..len {
        let up_move = highs[i] - highs[i - 1];
        let down_move = lows[i - 1] - lows[i];

        if up_move > down_move && up_move > 0.0 {
            plus_dm[i] = up_move;
        }
        
        if down_move > up_move && down_move > 0.0 {
            minus_dm[i] = down_move;
        }
    }

    let atr = calculate_atr(highs, lows, closes, period);
    
    // Smoothed +DM and -DM (Welles Wilder method)
    let mut smoothed_plus_dm = vec![0.0; len];
    let mut smoothed_minus_dm = vec![0.0; len];

    let mut sum_plus: f64 = plus_dm[1..=period].iter().sum();
    let mut sum_minus: f64 = minus_dm[1..=period].iter().sum();
    
    smoothed_plus_dm[period] = sum_plus;
    smoothed_minus_dm[period] = sum_minus;

    for i in (period + 1)..len {
        smoothed_plus_dm[i] = smoothed_plus_dm[i - 1] - (smoothed_plus_dm[i - 1] / period as f64) + plus_dm[i];
        smoothed_minus_dm[i] = smoothed_minus_dm[i - 1] - (smoothed_minus_dm[i - 1] / period as f64) + minus_dm[i];
    }

    let mut plus_di = vec![0.0; len];
    let mut minus_di = vec![0.0; len];
    let mut dx = vec![0.0; len];

    for i in period..len {
        if atr[i] > 0.0 {
            plus_di[i] = 100.0 * (smoothed_plus_dm[i] / atr[i]);
            minus_di[i] = 100.0 * (smoothed_minus_dm[i] / atr[i]);
        }
        
        let sum = plus_di[i] + minus_di[i];
        if sum > 0.0 {
            dx[i] = 100.0 * (plus_di[i] - minus_di[i]).abs() / sum;
        }
    }

    let mut adx = vec![0.0; len];
    let mut dx_sum = 0.0;
    
    for i in period..(period + period) {
        if i < len {
            dx_sum += dx[i];
        }
    }
    
    if period + period - 1 < len {
        adx[period + period - 1] = dx_sum / period as f64;
    }

    for i in (period + period)..len {
        adx[i] = ((adx[i - 1] * (period as f64 - 1.0)) + dx[i]) / period as f64;
    }

    AdxResult { plus_di, minus_di, adx }
}
