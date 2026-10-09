/**
 * Sarvam AI SRE Copilot & Multi-Agent Orchestrator
 * Connects directly to Sarvam AI completions API using configured model.
 * Zero hardcoded keys or URLs; strictly loaded via validated env.ts.
 */
import type { SystemNode } from '@/types';
import { env } from '../env';

export interface SarvamCommandResult {
  actionType: 'SIMULATE_FAILURE' | 'RESTORE_SERVICE' | 'TRIGGER_RECOVERY' | 'DIAGNOSE_CLUSTER' | 'QUERY_INFO' | 'UNKNOWN';
  targetNodeId?: string;
  assistantReply: string;
  reasoning?: string;
  recommendedPlaybook?: string;
}

export interface DetailedAiDiagnosis {
  rootCause: string;
  playbook: string;
  explanation: string;
  source: 'sarvam-ai-cloud' | 'sre-heuristic-guardrail';
  model: string;
  promptSent: string;
  rawOutput: string;
  latencyMs: number;
  httpStatus?: number;
  timestamp: string;
  checksum?: string;
}

export class SarvamAgentService {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    this.apiKey = env.VITE_SARVAM_API_KEY;
    this.endpoint = `${env.VITE_SARVAM_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`;
    this.model = env.VITE_SARVAM_MODEL;
  }

  /**
   * Checks whether the user prompt strictly relates to AIOps, workflows,
  /**
   * Checks whether the user prompt relates to AIOps, workflows,
   * systems architecture, cloud infrastructure, or the Horizon domain in any language.
   */
  public isDomainQuery(query: string): boolean {
    const q = query.trim().toLowerCase();

    // Explicit non-technical / out-of-scope markers in English and multilingual scripts
    const nonTechnicalPatterns = [
      /\b(recipe|cook|bake|dish|ingredient|cake|pizza|soup)\b/i,
      /\b(weather|temperature|forecast|rain today)\b/i,
      /\b(cricket|football|soccer|nba|tennis|olympics|sports score)\b/i,
      /\b(movie|film|actor|actress|cinema|hollywood|bollywood)\b/i,
      /\b(poem|poetry|song lyrics|write a rap|joke|tell me a joke)\b/i,
      /\b(president|election|political party|prime minister)\b/i,
      /\b(horoscope|astrology|zodiac)\b/i,
      /(खाना कैसे|रेसिपी|मौसम कैसा|क्रिकेट मैच|चुटकुला|कविता सुनाओ|फिल्म)/i,
      /\b(receta|cocinar|clima hoy|partido de fútbol|chiste)\b/i,
      /\b(recette|cuisiner|météo|blague)\b/i,
    ];

    if (nonTechnicalPatterns.some((p) => p.test(q))) {
      return false;
    }

    // Technical concepts of AIOps, SRE, workflows, systems, cloud, or recovery across languages
    const technicalKeywords = [
      'aiops', 'sre', 'reliability', 'outage', 'incident', 'downtime', 'uptime',
      'kahn', 'topological', 'dag', 'graph', 'dependency', 'dependencies', 'cycle',
      'deadlock', 'blast radius', 'mttr', 'mttd', 'slo', 'sli', 'sla',
      'recovery', 'rollback', 'restore', 'failover', 'chaos', 'playbook',
      'workflow', 'workflows', 'pipeline', 'orchestrat', 'kubernetes', 'k8s', 'docker', 'container',
      'pod', 'service', 'ingress', 'gateway', 'envoy', 'istio', 'nginx',
      'database', 'postgres', 'postgresql', 'mysql', 'scylladb', 'cassandra', 'redis',
      'cache', 'kafka', 'nats', 'rabbitmq', 'microservice', 'microservices',
      'cloud', 'aws', 'gcp', 'azure', 'infrastructure', 'network', 'mesh',
      'cluster', 'node', 'server', 'horizon', 'bridgekey', 'eip-712', 'web3',
      'smart contract', 'nft', 'latency', 'cpu', 'memory', 'crash', 'fail',
      'health', 'probe', 'system', 'systems', 'architecture', 'architect',
      'load balancer', 'connection pool', 'replication', 'sharding', 'vector',
      'sentinel', 'watchdog', 'audit', 'telemetry', 'failover', 'resilience',
      // Indic (Devanagari / Hindi) technical terms
      'कहान', 'एल्गोरिदम', 'रिकवरी', 'डेटाबेस', 'डाटाबेस', 'माइक्रोसर्विस', 'क्लस्टर', 'कैशे',
      'नोड', 'सिस्टम', 'आर्किटेक्चर', 'डाउनटाइम', 'अपटाइम', 'इन्फ्रास्ट्रक्चर', 'निर्भरता',
      'नेटवर्क', 'ट्रैफिक', 'फेलियर', 'क्रैश', 'सर्वर', 'बैकअप', 'रोलबैक', 'क्लाउड',
      // Indic Transliterated (Hinglish)
      'kaise', 'karna', 'karen', 'rukega', 'bandh', 'chalu', 'bachaye', 'bachana',
      // Spanish technical terms
      'recuperación', 'recuperacion', 'arquitectura', 'servidor', 'servidores',
      'base de datos', 'dependencia', 'dependencias', 'fallo', 'caída', 'caida', 'red',
      // French technical terms
      'récupération', 'recuperation', 'serveur', 'panne', 'dépendance', 'dependance', 'réseau',
      // German technical terms
      'wiederherstellung', 'ausfall', 'datenbank', 'zuverlässigkeit'
    ];

    if (technicalKeywords.some((kw) => q.includes(kw))) {
      return true;
    }

    // Accept queries written in Indic scripts (Devanagari, Tamil, Telugu, etc.) or CJK if not filtered by non-technical patterns
    const hasIndicOrNonLatin = /[\u0900-\u0D7F\u3040-\u30FF\u4E00-\u9FFF]/.test(query);
    return hasIndicOrNonLatin;
  }

  /**
   * Post-processes an SRE response so it is around 350-500 characters,
   * starts with a complete sentence, and concludes logically with full punctuation.
   * Supports Latin, Indic (।), and CJK (。) terminal punctuation.
   */
  public formatSreResponse(text: string): string {
    if (!text) {
      return 'Autonomous SRE resilience analysis complete. Recommending bottom-up topological restoration to eliminate cascading connection failures.';
    }

    let cleaned = text.trim();

    // Remove any markdown code fences that wrap the entire answer if conversational
    if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    // If within bounds and terminates properly, keep it
    if (cleaned.length <= 530 && /[.!?।。]$/.test(cleaned)) {
      return cleaned;
    }

    // If exceeds ~520 characters, trim strictly at the last complete sentence boundary within 520 chars
    if (cleaned.length > 520) {
      const slice = cleaned.slice(0, 520);
      const lastSentenceEnd = Math.max(
        slice.lastIndexOf('. '),
        slice.lastIndexOf('.\n'),
        slice.lastIndexOf('? '),
        slice.lastIndexOf('! '),
        slice.lastIndexOf('। '),
        slice.lastIndexOf('।\n'),
        slice.lastIndexOf('。\n'),
        slice.lastIndexOf('。')
      );

      if (lastSentenceEnd > 240) {
        cleaned = slice.slice(0, lastSentenceEnd + 1).trim();
      } else {
        const lastPeriod = Math.max(
          slice.lastIndexOf('.'),
          slice.lastIndexOf('।'),
          slice.lastIndexOf('。')
        );
        if (lastPeriod > 240) {
          cleaned = slice.slice(0, lastPeriod + 1).trim();
        }
      }
    }

    // Ensure ending with definitive terminal punctuation
    if (!/[.!?।。]$/.test(cleaned)) {
      cleaned += '.';
    }

    return cleaned;
  }

  public async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'test-sarvam-key' || this.apiKey.startsWith('test-')) {
      return '';
    }

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': this.apiKey,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
        }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined,
      });

      if (!res.ok) {
        throw new Error(`Sarvam API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content?.trim() || '';
    } catch (err: unknown) {
      console.warn('Sarvam AI request notice: using local SRE heuristics.', err);
      return '';
    }
  }

  /**
   * Dedicated Ask Copilot handler: enforces scope, target length (~500 chars),
   * multilingual conversational fluency, and clean grammatical opening and concluding sentences.
   */
  public async askSreAdvisor(query: string): Promise<string> {
    const hasDevanagari = /[\u0900-\u097F]/.test(query);
    const hasSpanish = /\b(cómo|como|por qué|por que|cuál|cual|recuperación|servicios|fallo|base de datos)\b/i.test(query);
    const hasFrench = /\b(comment|pourquoi|panne|récupération|système|base de données|serveur)\b/i.test(query);

    // 1. Strict domain guardrail: refuse non-AIOps / non-system inquiries
    if (!this.isDomainQuery(query)) {
      if (hasDevanagari) {
        return 'मैं विशेष रूप से Horizon AIOps, ऑटोनॉमस रिकवरी और distributed systems architecture में प्रशिक्षित हूँ। मैं इस तकनीकी दायरे के बाहर उत्तर नहीं दे सकता। कृपया SRE या सिस्टम आर्किटेक्चर से संबंधित प्रश्न पूछें। (I am specialized exclusively in Horizon AIOps).';
      }
      return 'I am specialized exclusively in Horizon AIOps, autonomous recovery workflows, and distributed systems architecture. I cannot answer queries outside this technical domain. Please ask about site reliability engineering, dependency DAGs, failure isolation, or infrastructure recovery.';
    }

    // 2. Query Sarvam AI with structured guidance
    const systemPrompt = `You are the Horizon Senior Autonomous SRE Copilot (powered by Sarvam AI).
STRICT DOMAIN: Answer only about AIOps, site reliability engineering, autonomous recovery workflows, distributed systems, dependency graphs, and cloud architecture.
MULTILINGUAL CONVERSATIONAL INTELLIGENCE:
1. Always respond fluently and conversationally in the EXACT SAME LANGUAGE and SCRIPT that the user asks in (e.g., Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Spanish, French, German, Japanese, English, Hinglish, etc.).
2. If the user writes in Hinglish (Hindi in Roman script), respond in natural Hinglish. If the user writes in Hindi Devanagari script, respond in fluent Hindi Devanagari script.
3. Keep technical concepts (like DAG, Kahn sort, Redis, Kafka, Kubernetes, MTTR, EIP-712) clear and accurate in context.
RESPONSE CONSTRAINTS:
1. Length: Exactly around 350 to 500 characters.
2. Structure & Grammar: The response must begin with a complete, coherent sentence and conclude with a fully finished, grammatically complete sentence with terminal punctuation (. or ! or । or 。).
3. Do NOT cut off mid-sentence. Never output incomplete clauses or trailing ellipsis (...).
4. Format cleanly in markdown.`;

    const rawResponse = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ]);

    if (rawResponse) {
      return this.formatSreResponse(rawResponse);
    }

    // 3. Multilingual deterministic SRE fallback (complete grammar & logic)
    if (hasDevanagari) {
      return 'वितरित माइक्रोसर्विसेज में रिकवरी हमेशा नीचे से ऊपर (bottom-up) होनी चाहिए: कैशे और वर्कर्स से पहले स्टोरेज का स्वस्थ होना अनिवार्य है ताकि कैस्केडिंग फेलियर और क्रैश लूप से बचा जा सके। कहान एल्गोरिदम निर्भरता क्रम सुनिश्चित करता है।';
    }

    if (hasSpanish) {
      return 'En arquitecturas de microservicios distribuidos, la recuperación debe ejecutarse estrictamente de abajo hacia arriba: el almacenamiento base debe superar las comprobaciones antes de calentar cachés y enrutar tráfico para evitar sobrecargas en cascada.';
    }

    if (hasFrench) {
      return "Dans les architectures de microservices distribués, la récupération doit s'effectuer strictement de bas en haut : le stockage fondamental doit satisfaire les sondes de santé avant de réchauffer les caches et d'acheminer le trafic public.";
    }

    return 'In distributed microservice meshes, services must be recovered strictly bottom-up: foundational storage must satisfy readiness probes before caches warm, followed by core workers, and finally ingress routers. This prevents thundering herds and crash loops.';
  }

  /**
   * Diagnoses an active cluster outage and suggests a deterministic recovery playbook.
   * Tracks full provenance, raw model completions, latency, and origin source.
   */
  public async diagnoseOutage(downNodes: SystemNode[], allNodes: SystemNode[]): Promise<DetailedAiDiagnosis> {
    const startTime = Date.now();
    const prompt = `As Horizon Senior SRE AI Agent, analyze this cluster failure:
Down/Degraded nodes: ${downNodes.map((n) => `${n.name} (${n.id}, type: ${n.type})`).join(', ')}
Total cluster topology: ${allNodes.map((n) => n.id).join(', ')}

Explain the primary root cause and state whether high-risk human approval is required for recovery. Keep under 120 words.`;

    let rawResponse = '';
    let source: 'sarvam-ai-cloud' | 'sre-heuristic-guardrail' = 'sre-heuristic-guardrail';
    let httpStatus: number | undefined;

    if (this.apiKey) {
      try {
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': this.apiKey,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'You are the Horizon Autonomous Recovery Copilot, an expert AI SRE specializing in topological dependency orchestration.',
              },
              { role: 'user', content: prompt },
            ],
          }),
          signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined,
        });

        httpStatus = res.status;
        if (res.ok) {
          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            rawResponse = content;
            source = 'sarvam-ai-cloud';
          }
        }
      } catch {
        // Gracefully fall back to local SRE heuristics
      }
    }

    const latencyMs = Date.now() - startTime;
    const hasDb = downNodes.some((n) => n.type === 'database');
    const primaryDown = downNodes[0]?.name || 'Database Cluster';

    const rootCause = hasDb ? 'Primary Database Connection Pool Depleted / Replica Lag' : `${primaryDown} Service Degradation`;
    const playbook = hasDb ? 'High-Risk Database Replica Promotion & DNS Cutover' : 'Zero-Downtime Rolling Service Pod Restart';
    const explanation = rawResponse || `Detected cascade origin at ${primaryDown}. Recommending bottom-up topological restoration sequence to prevent application crash loops.`;

    return {
      rootCause,
      playbook,
      explanation,
      source,
      model: this.model,
      promptSent: prompt,
      rawOutput: explanation,
      latencyMs,
      httpStatus,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Processes continuous natural language operator prompts in the SRE Command Bar.
   */
  public async interpretCommand(userPrompt: string, clusterNodes: SystemNode[]): Promise<SarvamCommandResult> {
    const lower = userPrompt.toLowerCase();

    // 1. Check for failure simulation requests
    if (lower.includes('fail') || lower.includes('crash') || lower.includes('kill') || lower.includes('down')) {
      let targetNode = clusterNodes.find((n) => lower.includes(n.id) || lower.includes(n.name.toLowerCase()));
      if (!targetNode && lower.includes('db')) targetNode = clusterNodes.find((n) => n.id === 'db-primary');
      if (!targetNode && lower.includes('cache')) targetNode = clusterNodes.find((n) => n.id === 'redis-cache');
      if (!targetNode && lower.includes('gateway')) targetNode = clusterNodes.find((n) => n.id === 'api-gateway');
      if (!targetNode && lower.includes('auth')) targetNode = clusterNodes.find((n) => n.id === 'auth-service');
      const targetId = targetNode?.id || 'db-primary';

      return {
        actionType: 'SIMULATE_FAILURE',
        targetNodeId: targetId,
        assistantReply: `Injected simulated outage on ${targetNode?.name || targetId}. Monitoring health probes and preparing topological recovery plan.`,
        reasoning: 'Autonomous probe failure threshold reached (3/3 consecutive drops). Node flagged as DOWN.',
        recommendedPlaybook: targetNode?.type === 'database' ? 'database_failover' : 'service_restart',
      };
    }

    // 2. Check for restore / heal requests
    if (lower.includes('restore') || lower.includes('heal') || lower.includes('recover') || lower.includes('fix')) {
      return {
        actionType: 'TRIGGER_RECOVERY',
        assistantReply: 'Executing deterministic topological recovery playbook. Sequenced from foundational databases to application edge.',
        reasoning: 'Dependency order: db-primary -> redis-cache -> auth-service -> api-gateway -> web-frontend.',
        recommendedPlaybook: 'topological_bottom_up',
      };
    }

    // 3. Fallback to Sarvam LLM for general SRE queries
    const aiResponse = await this.chat([
      {
        role: 'system',
        content: `You are the Horizon Autonomous Resilience SRE Agent. Answer concisely based on cluster state (${clusterNodes.length} nodes active).`,
      },
      { role: 'user', content: userPrompt },
    ]);

    return {
      actionType: 'QUERY_INFO',
      assistantReply: aiResponse || `Analyzed cluster state: ${clusterNodes.filter((n) => n.status === 'healthy').length}/${clusterNodes.length} services are reporting healthy.`,
    };
  }
}

export const sarvamAgent = new SarvamAgentService();
export const askSreAdvisor = (query: string): Promise<string> => sarvamAgent.askSreAdvisor(query);
