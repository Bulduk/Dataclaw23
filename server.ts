import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

// --- Orchestrator & Agents ---
interface AgentConfig {
  id: string;
  name: string;
  source: string;
  role: string;
  model: string;
  prompt: string;
  enabled: boolean;
  risk_level: string;
  confidence_threshold: number;
  api_endpoint?: string;
  repo_url?: string;
  capabilities: string[];
}

class AgentRegistry {
  private agents: Record<string, AgentConfig> = {};
  constructor() { this.bootstrapCore(); }
  private bootstrapCore() {
    const cores: AgentConfig[] = [
      { id: 'openclaw', name: 'OpenClaw', source: 'core', role: 'executor', model: 'claude-haiku', prompt: 'Execution routing', enabled: true, risk_level: 'medium', confidence_threshold: 70, capabilities: [] },
      { id: 'mirofish', name: 'Mirofish', source: 'core', role: 'signal', model: 'claude-sonnet', prompt: 'Signal generation', enabled: true, risk_level: 'medium', confidence_threshold: 70, capabilities: [] },
      { id: 'betafish', name: 'Betafish', source: 'core', role: 'arbitrage', model: 'claude-sonnet', prompt: 'Arbitrage', enabled: true, risk_level: 'medium', confidence_threshold: 70, capabilities: [] },
      { id: 'onyx', name: 'Onyx', source: 'core', role: 'research', model: 'claude-opus', prompt: 'Research', enabled: true, risk_level: 'high', confidence_threshold: 70, capabilities: [] }
    ];
    cores.forEach(a => this.agents[a.id] = a);
  }
  public register(agent: AgentConfig) { this.agents[agent.id] = agent; }
  public getAll() { return Object.values(this.agents); }
}

const registry = new AgentRegistry();

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  // --- Real-time Crypto Market Data via Binance WS (Direct Speed) ---
  let cachedMarketData: any = {};
  
  const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
  
  binanceWs.on('open', () => console.log('[Binance WS] Connected for live market data'));
  
  binanceWs.on('message', (data: any) => {
    try {
      const parsed = JSON.parse(data);
      // Relay only relevant assets for speed
      const relevant = parsed.filter((t: any) => ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT'].includes(t.s));
      if (relevant.length > 0) {
        relevant.forEach((t: any) => {
          cachedMarketData[t.s] = { price: parseFloat(t.c), vol: parseFloat(t.v), change: parseFloat(t.P) };
        });
        
        // Broadcast to clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'market_data', data: cachedMarketData }));
          }
        });
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  binanceWs.on('error', (err) => console.error('[Binance WS] Error', err));

  // Client WS handling
  wss.on('connection', (ws) => {
    console.log('[System WS] Client connected UI');
    ws.send(JSON.stringify({ type: 'market_data', data: cachedMarketData }));
    
    ws.on('message', (msg) => {
       // Future direct RPC from frontend
    });
  });

  // API Routes
  app.get('/api/agents', (req, res) => res.json(registry.getAll()));

  // Onyx (Research): System Bridge Optimization - Server-Sent Events (SSE)
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send immediate generic handshake
    res.write(`data: ${JSON.stringify({ type: 'handshake', message: 'SSE Connection Established' })}\n\n`);

    // Simulate real-time signals being pushed from internal agents
    const interval = setInterval(() => {
      const confidence = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // 65 to 95
      const signal = {
        type: 'signal',
        source: 'betafish',
        confidence,
        timestamp: new Date().toISOString(),
        direction: Math.random() > 0.5 ? 'LONG' : 'SHORT'
      };
      res.write(`data: ${JSON.stringify(signal)}\n\n`);
    }, 5000);

    req.on('close', () => {
      clearInterval(interval);
    });
  });

  app.post('/api/agents/add/repo', async (req, res) => {
    const { repo_url, name, role, confidence_threshold, target_agent, preflight_only } = req.body;
    
    // PolicyGuard: %85 Trust Threshold check for external repos
    const threshold = confidence_threshold || 85; 

    // Repo Analizi & Model Otomasyonu (Simulated)
    const lowerUrl = (repo_url || '').toLowerCase();
    const isModel = lowerUrl.includes('model') || lowerUrl.includes('nim') || lowerUrl.includes('vllm') || lowerUrl.includes('llama') || lowerUrl.includes('deepseek');
    const isTool = lowerUrl.includes('tool') || lowerUrl.includes('plugin') || lowerUrl.includes('freqtrade');
    const repoType = isModel ? 'model' : (isTool ? 'tool' : 'agent');
    const displayType = isModel ? 'Local Inference Resource (Model)' : (isTool ? 'Tool/Plugin' : 'Autonomous Agent');

    if (preflight_only) {
      if (threshold < 85 && !isModel) {
        return res.json({
          status: 'rejected',
          analysis: `[Pre-flight Check] PolicyGuard Uyarısı: Güven eşiği (%85) sağlanamadı. Olası Sandboxing hatası. ${displayType} manuel inceleme gerektiriyor.`
        });
      }
      return res.json({
         status: 'success',
         repo_type: repoType,
         display_type: displayType,
         analysis: `[Pre-flight Check] Repo: ${displayType}. Sandboxing (izole konteyner) okuma izni onaylandı. Hedef Ajan: ${target_agent || 'Tümü'}.`
      });
    }

    if (threshold < 85 && !isModel) {
      return res.status(403).json({ 
        status: 'rejected', 
        reason: 'PolicyGuard: Kurulum iptal edildi (Rollback). Minimum %85 güven sınırı aşılamadı.',
        rollback: true,
        threshold_required: 85,
        current_threshold: threshold
      });
    }

    try {
      console.log(`[UnifiedInstallerService] Sandboxed container preparing for ${repo_url}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating install
      
      let entity: any = {
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000),
        name: name,
        repo_url: repo_url
      };

      if (isModel) {
        entity.source = 'local_repo';
        entity.endpoint = `http://localhost:${Math.floor(8000+Math.random()*1000)}/v1`;
        entity.assignedTo = target_agent;
      } else {
        entity.source = 'plugin';
        entity.role = role || 'worker';
        entity.model = 'custom';
        entity.prompt = `Orchestrated repo: ${repo_url}`;
        entity.enabled = true;
        entity.risk_level = 'medium';
        entity.confidence_threshold = threshold;
        entity.capabilities = ['multi-agent-automation'];
        registry.register(entity);
      }
      
      res.json({ 
        status: 'success', 
        message: `UnifiedInstallerService: ${displayType} başarıyla klonlandı ve yüklendi.`,
        entity,
        repoType
      });
    } catch (e: any) {
      // Simulate rollback
      res.status(500).json({ status: 'error', reason: 'Pre-flight crash: ' + (e.message || 'Unknown error'), rollback: true });
    }
  });

  app.post('/api/nasa/execute', async (req, res) => {
    const { command, context } = req.body;
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simüle gecikme
    
    let responseText = "Sistem güncellemeleri kontrol ediliyor...";
    let logs = [];

    const lowerCmd = (command || "").toLowerCase();

    if (lowerCmd.includes("optimize et") || lowerCmd.includes("ram")) {
      responseText = "[NASA] Sistem optimizasyonu başlatıldı ve RAM temizliği (Garbage Collection) simüle edildi.";
      logs = [
        "[OK] RAM %14 seviyesindeki gereksiz yük temizlendi.",
        "[OK] Pasif ajanlar (OpenClaw, vb.) yeniden bağlantı sırasına eklendi."
      ];
    } else if (lowerCmd.includes("openclaw pasif") || lowerCmd.includes("açıklama")) {
      responseText = "[Log Analizi] OpenClaw ajanı şu anda Beklemede (Pending) çünkü Supabase URL ve Anon Key tanımları 'Vault (Merkezi Konfigürasyon Kasası)' üzerinde doğrulanmadı. NASA Vault içindeki bağlantıları kontrol edin.";
    } else if (lowerCmd.includes("vllm") || lowerCmd.includes("nvidia llm") || lowerCmd.includes("kur")) {
      responseText = "[Deploy] vLLM ve Nvidia Nim Container'ları VPS/Localhost üzerinde kurulum sırasına alındı. Docker socket erişimi sağlandıktan sonra 'UnifiedInstallerService' üzerinden `http://localhost:8000/v1` otomatik eklenecektir.";
    } else {
      responseText = `[NASA Executor] '${command}' analize alındı. Statik modül kurallarına göre işlem yapılıyor. Vault denetleniyor...`;
    }

    res.json({ message: responseText, logs: logs });
  });

  app.post('/api/config/save', (req, res) => {
    // Burada config.json dosyasına yazma veya Last_Known_Good_Config simülasyonu yapıyoruz.
    console.log("[NASA] Konfigürasyonlar config.json'a otonom kaydedildi (Simüle).", req.body);
    res.json({ status: "success", message: "Config JSON yedeği alındı." });
  });

  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    try {
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      
      // Simulate OpenClaw + CrewAI responses based on user input
      let responseText = "";
      
      if (lastMessage.includes("boot") || lastMessage.includes("rapor")) {
        responseText = "[OpenClaw: SYS_READY] CrewAI entegrasyonu aktif. Ajanlar komut bekliyor. OpenClaw ve CrewAI senkronize çalışıyor. Tüm sistemler normal.\nSisteme hangi ajanları yöneteceğimi veya hangi hedefe odaklanacağımızı belirtebilirsin.";
      } else if (lastMessage.includes("crew") || lastMessage.includes("open claw")) {
        responseText = "[CrewAI Orchestrator] OpenClaw ile iletişim kuruldu.\n👉 Görev ataması OpenClaw tarafından alındı, alt işleyicilere (Onyx, Mirofish vb.) CrewAI üzerinden dağıtımı yapılıyor. Durum raporu:\n- OpenClaw: Yönlendirici aktif.\n- CrewAI: Ajan sırası yönetiliyor.\nKomutları işliyoruz.";
      } else if (lastMessage.includes("durum") || lastMessage.includes("status")) {
        responseText = "[System Report] OpenClaw + CrewAI Aktif.\n- Ağlantı: Güvenli.\n- Sinyaller: Taranıyor.\n- Ajan Durumu: Otonom modda.";
      } else {
        responseText = `[OpenClaw + CrewAI] Anlaşıldı eylem başlatılıyor: /${messages[messages.length - 1].content}/\nAjanlar (Onyx, Mirofish) CrewAI üzerinden paralel analize başladı. Lütfen sonuçları takip edin.`;
      }
      
      // Add slight delay to simulate agent 'thinking'
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ content: [{ text: responseText }] });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: String(error.message) });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  server.listen(PORT, '0.0.0.0', () => console.log(`POULS Server running on http://localhost:${PORT}`));
}
startServer();
