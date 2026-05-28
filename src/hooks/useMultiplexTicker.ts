import { useState, useEffect, useRef } from 'react';

export function useMultiplexTicker(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (symbols.length === 0) return;

    const streams = symbols.map(s => `${s.replace('/', '').toLowerCase()}@ticker`).join('/');
    ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.data && msg.data.s && msg.data.c) {
         const symbol = msg.data.s.toUpperCase();
         // format symbol back to 'BTC/USDT'
         const formattedSymbol = symbol.endsWith('USDT') ? symbol.replace('USDT', '/USDT') : symbol;
         setPrices(prev => ({
            ...prev,
            [formattedSymbol]: parseFloat(msg.data.c)
         }));
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [symbols.join(',')]);

  return prices;
}
