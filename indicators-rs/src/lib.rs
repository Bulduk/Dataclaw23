pub mod sma;
pub mod ema;
pub mod rsi;
pub mod macd;
pub mod atr;
pub mod bollinger;
pub mod bb_squeeze;
pub mod vwap;
pub mod adx;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn initialize() {
    // Optionally setup panic hook for wasm
    // std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}
