import { useState, useEffect, useRef } from 'react';

export interface OrderbookEntry {
  price: number;
  qty: number;
  total: number;
}

export interface MarketData {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  orderbook: {
    bids: OrderbookEntry[];
    asks: OrderbookEntry[];
  };
  trades: { price: number; qty: number; time: number; isBuyerMaker: boolean }[];
}

export function useRealtimeMarket(symbol: string = 'btcusdt') {
  const [data, setData] = useState<MarketData>({
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    orderbook: { bids: [], asks: [] },
    trades: []
  });

  const wsTicker = useRef<WebSocket | null>(null);
  const wsDepth = useRef<WebSocket | null>(null);
  const wsTrades = useRef<WebSocket | null>(null);

  useEffect(() => {
    const s = symbol.toLowerCase();
    
    // 1. Ticker Stream (24hr stats)
    wsTicker.current = new WebSocket(`wss://stream.binance.com:9443/ws/${s}@ticker`);
    wsTicker.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setData(prev => ({
        ...prev,
        price: parseFloat(msg.c),
        change: parseFloat(msg.p),
        changePercent: parseFloat(msg.P),
        volume: parseFloat(msg.v)
      }));
    };

    // 2. Depth Stream (Orderbook Top 10)
    wsDepth.current = new WebSocket(`wss://stream.binance.com:9443/ws/${s}@depth10@100ms`);
    wsDepth.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      let accumBid = 0;
      const bids = (msg.b || []).map((b: string[]) => {
        const qty = parseFloat(b[1]);
        accumBid += qty;
        return { price: parseFloat(b[0]), qty, total: accumBid };
      });

      let accumAsk = 0;
      const asks = (msg.a || []).map((a: string[]) => {
        const qty = parseFloat(a[1]);
        accumAsk += qty;
        return { price: parseFloat(a[0]), qty, total: accumAsk };
      }).reverse(); // Asks highest to lowest

      setData(prev => ({
        ...prev,
        orderbook: { bids, asks }
      }));
    };

    // 3. Trade Stream
    wsTrades.current = new WebSocket(`wss://stream.binance.com:9443/ws/${s}@trade`);
    wsTrades.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const trade = {
        price: parseFloat(msg.p),
        qty: parseFloat(msg.q),
        time: msg.T,
        isBuyerMaker: msg.m
      };
      setData(prev => {
        const newTrades = [trade, ...prev.trades].slice(0, 30); // Keep last 30 trades
        return { ...prev, trades: newTrades };
      });
    };

    return () => {
        wsTicker.current?.close();
        wsDepth.current?.close();
        wsTrades.current?.close();
    };
  }, [symbol]);

  return data;
}
