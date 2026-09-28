/**
 * OSI Interactive Suite - Interactive Simulators Engine
 * Handles Encapsulation / Decapsulation Pipeline and TCP Handshake State Machine
 */

class PacketSimulator {
  constructor() {
    this.currentStep = 0;
    this.maxSteps = 7;
    this.isPlaying = false;
    this.playTimer = null;
    this.config = {
      payload: "GET /index.html HTTP/1.1",
      l4Proto: "TCP",
      l3Proto: "IPv4",
      srcPort: 52144,
      dstPort: 443,
      srcIp: "192.168.1.105",
      dstIp: "93.184.216.34",
      srcMac: "3C:52:82:11:22:33",
      dstMac: "00:1A:2B:3C:4D:5E"
    };
  }

  init() {
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    const nextBtn = document.getElementById("sim-next-btn");
    const prevBtn = document.getElementById("sim-prev-btn");
    const playBtn = document.getElementById("sim-play-btn");
    const resetBtn = document.getElementById("sim-reset-btn");
    const payloadInput = document.getElementById("sim-payload-input");
    const l4Select = document.getElementById("sim-l4-select");
    const l3Select = document.getElementById("sim-l3-select");

    if (nextBtn) nextBtn.addEventListener("click", () => this.nextStep());
    if (prevBtn) prevBtn.addEventListener("click", () => this.prevStep());
    if (playBtn) playBtn.addEventListener("click", () => this.togglePlay());
    if (resetBtn) resetBtn.addEventListener("click", () => this.reset());

    if (payloadInput) {
      payloadInput.addEventListener("input", (e) => {
        this.config.payload = e.target.value || "GET /index.html HTTP/1.1";
        this.updateUI();
      });
    }

    if (l4Select) {
      l4Select.addEventListener("change", (e) => {
        this.config.l4Proto = e.target.value;
        this.config.dstPort = e.target.value === "TCP" ? 443 : 53;
        this.updateUI();
      });
    }

    if (l3Select) {
      l3Select.addEventListener("change", (e) => {
        this.config.l3Proto = e.target.value;
        if (e.target.value === "IPv6") {
          this.config.srcIp = "fe80::3e52:82ff:fe11:2233";
          this.config.dstIp = "2606:2800:220:1:248:1893:25c8:1946";
        } else {
          this.config.srcIp = "192.168.1.105";
          this.config.dstIp = "93.184.216.34";
        }
        this.updateUI();
      });
    }
  }

  nextStep() {
    if (this.currentStep < this.maxSteps) {
      this.currentStep++;
      this.updateUI();
    } else {
      this.pause();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateUI();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    const playBtn = document.getElementById("sim-play-btn");
    if (playBtn) playBtn.innerHTML = `<span>⏸ Pause</span>`;

    if (this.currentStep >= this.maxSteps) {
      this.currentStep = 0;
      this.updateUI();
    }

    this.playTimer = setInterval(() => {
      if (this.currentStep < this.maxSteps) {
        this.nextStep();
      } else {
        this.pause();
      }
    }, 2200);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.playTimer);
    const playBtn = document.getElementById("sim-play-btn");
    if (playBtn) playBtn.innerHTML = `<span>▶ Auto Play</span>`;
  }

  reset() {
    this.pause();
    this.currentStep = 0;
    this.updateUI();
  }

  stringToBinary(str) {
    return str
      .split("")
      .slice(0, 16)
      .map(c => c.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ") + (str.length > 16 ? " ..." : "");
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  updateUI() {
    const step = this.currentStep;
    const cfg = this.config;
    const stageContainer = document.getElementById("sim-stage-container");
    const stepBadge = document.getElementById("sim-step-badge");
    const explanationText = document.getElementById("sim-explanation-text");
    const pduTypeBadge = document.getElementById("sim-pdu-badge");

    const stepsInfo = [
      {
        badge: "Step 0 / 7 : Application Layer (L7)",
        pdu: "Application Message (L7 PDU)",
        color: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
        explanation: "The user program (e.g. web browser, API client) creates raw application payload data (SDU). For web navigation, this is an HTTP request, DNS query, or RPC call. No session states, presentation encodings, or transport port headers exist yet."
      },
      {
        badge: "Step 1 / 7 : Presentation Layer (L6) Formatting & Cryptography",
        pdu: "Formatted / Encrypted Record (L6 PDU)",
        color: "text-teal-400 border-teal-500/40 bg-teal-500/10",
        explanation: "The presentation layer translates data from local host representation to standard network transfer syntax (e.g., ASN.1 DER, Protobuf, JSON, or Network Byte Order Big-Endian). For secure connections, it wraps the data in a <strong>TLS 1.3 Record</strong> with AEAD encryption (AES-256-GCM / ChaCha20-Poly1305) and an integrity authentication tag."
      },
      {
        badge: "Step 2 / 7 : Session Layer (L5) Dialogue & Checkpoints",
        pdu: "Session PDU (L5 PDU)",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
        explanation: "The session layer establishes and tracks the dialogue between communicating software entities. It coordinates dialogue direction (full-duplex vs half-duplex), assigns session tokens, and places synchronization checkpoints (minor/major sync points) so lost connections can resume without restarting the whole transaction."
      },
      {
        badge: "Step 3 / 7 : Transport Layer (L4) Segment / Datagram",
        pdu: cfg.l4Proto === "TCP" ? "TCP Segment (L4 PDU)" : "UDP Datagram (L4 PDU)",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        explanation: `The transport layer prepends a <strong>${cfg.l4Proto} Header</strong> (${cfg.l4Proto === "TCP" ? "20–60 bytes with Seq/Ack/Flags" : "8 bytes with Source/Dest Ports"}). It binds the session data to Source Port <code>${cfg.srcPort}</code> and Destination Port <code>${cfg.dstPort}</code>, creating a <strong>${cfg.l4Proto === "TCP" ? "Segment" : "Datagram"}</strong>.`
      },
      {
        badge: "Step 4 / 7 : Network Layer (L3) Packet",
        pdu: `${cfg.l3Proto} Packet (L3 PDU)`,
        color: "text-sky-400 border-sky-500/40 bg-sky-500/10",
        explanation: `The network layer treats the entire L4 segment as its SDU and prepends an <strong>${cfg.l3Proto} Header</strong> (${cfg.l3Proto === "IPv4" ? "20 bytes" : "40 bytes"}). It specifies Source IP <code>${cfg.srcIp}</code> and Destination IP <code>${cfg.dstIp}</code> to permit routing across intermediate routers.`
      },
      {
        badge: "Step 5 / 7 : Data Link Layer (L2) Frame (Header + FCS Trailer)",
        pdu: "Ethernet Frame (L2 PDU)",
        color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        explanation: `The data link layer encapsulates the IP packet into a <strong>Frame</strong>. It adds a 14-byte <strong>MAC Header</strong> (Src: <code>${cfg.srcMac}</code>, Dst: <code>${cfg.dstMac}</code>) AND uniquely appends a 4-byte <strong>FCS (Frame Check Sequence) Trailer</strong> with a 32-bit CRC checksum calculated across the entire frame!`
      },
      {
        badge: "Step 6 / 7 : Physical Layer (L1) Bit Serialization",
        pdu: "Raw Physical Bits (L1 PDU)",
        color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
        explanation: "The NIC transceiver converts the completed frame into an unformatted bitstream of electrical voltage levels (copper), laser light pulses (fiber), or radio wave modulations (Wi-Fi) traversing the physical media."
      },
      {
        badge: "Step 7 / 7 : Receiver Decapsulation (Bottom-to-Top Stripping)",
        pdu: "Pristine Payload Delivered to App",
        color: "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
        explanation: "The receiving host decapsulates bottom-to-top: L1 syncs clock; L2 validates the FCS CRC-32 trailer & strips MAC headers; L3 verifies destination IP & decrements TTL; L4 demuxes to socket port; L5 maps session dialogue state; L6 verifies AEAD tag & decrypts TLS record; L7 delivers pristine application message to the server process!"
      }
    ];

    const currentInfo = stepsInfo[step];
    if (stepBadge) stepBadge.textContent = currentInfo.badge;
    if (pduTypeBadge) {
      pduTypeBadge.textContent = currentInfo.pdu;
      pduTypeBadge.className = `px-3 py-1 text-xs font-mono font-semibold rounded-full border ${currentInfo.color}`;
    }
    if (explanationText) explanationText.innerHTML = currentInfo.explanation;

    if (stageContainer) {
      stageContainer.innerHTML = this.renderStage(step, cfg);
    }
  }

  renderStage(step, cfg) {
    const safePayload = this.escapeHtml(cfg.payload);
    const rawPayloadHtml = `<div class="packet-block bg-indigo-950/70 border border-indigo-500/50 text-indigo-200 px-4 py-3 rounded-lg font-mono text-sm shadow-md flex-1 text-center truncate">
      <span class="text-xs uppercase tracking-wider text-indigo-400 block font-sans">L7 Application Payload</span>
      "${safePayload}"
    </div>`;

    if (step === 0) {
      return `
        <div class="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-indigo-400 mb-2">RAW APPLICATION DATA (SDU)</div>
          ${rawPayloadHtml}
        </div>
      `;
    }

    if (step === 1) {
      const l6Record = `<div class="packet-block bg-teal-950/80 border border-teal-500/60 text-teal-200 px-4 py-3 rounded-lg font-mono text-xs shadow-md text-center">
        <span class="text-xs uppercase tracking-wider text-teal-400 block font-sans">TLS 1.3 Record (L6)</span>
        ContentType: 23 (App Data) • Big-Endian Wire
      </div>`;
      const aeadTag = `<div class="packet-block bg-teal-950/90 border border-teal-400 text-teal-300 px-3 py-3 rounded-lg font-mono text-xs shadow-md text-center">
        <span class="text-[10px] uppercase font-sans text-teal-400 block font-bold">AEAD Tag (16B)</span>
        0xA3F9..8E12
      </div>`;
      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-teal-400 mb-2">LAYER 6: PRESENTATION / TLS 1.3 RECORD ENVELOPE</div>
          <div class="flex flex-wrap items-center gap-2 w-full max-w-3xl justify-center">
            ${l6Record}
            <div class="p-2 rounded-lg border border-teal-500/30 bg-teal-950/30 flex items-center gap-2">
              <span class="text-[11px] font-mono text-teal-300">🔐 Ciphertext:</span>
              ${rawPayloadHtml}
            </div>
            ${aeadTag}
          </div>
        </div>
      `;
    }

    if (step === 2) {
      const l5Header = `<div class="packet-block bg-rose-950/80 border border-rose-500/60 text-rose-200 px-3 py-2.5 rounded-lg font-mono text-xs shadow-md text-center">
        <span class="text-xs uppercase tracking-wider text-rose-400 block font-sans">Session Dialogue (L5)</span>
        Token: #0x82A1 • Full-Duplex • Sync Pt: 1
      </div>`;
      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-rose-400 mb-2">LAYER 5: SESSION DIALOGUE TRACKING & CHECKPOINTS</div>
          <div class="flex flex-wrap items-center gap-2 w-full max-w-3xl justify-center">
            ${l5Header}
            <div class="flex items-center gap-1.5 p-2 rounded-lg border border-rose-500/30 bg-rose-950/20">
              <span class="text-[11px] font-mono text-rose-300">L6 Record:</span>
              ${rawPayloadHtml}
            </div>
          </div>
        </div>
      `;
    }

    if (step === 3) {
      const l4Header = `<div class="packet-block bg-amber-950/80 border border-amber-500/60 text-amber-200 px-4 py-3 rounded-lg font-mono text-sm shadow-md text-center">
        <span class="text-xs uppercase tracking-wider text-amber-400 block font-sans">${cfg.l4Proto} Header</span>
        Ports: ${cfg.srcPort} → ${cfg.dstPort}
      </div>`;
      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-amber-400 mb-2">LAYER 4: ${cfg.l4Proto.toUpperCase()} SEGMENT</div>
          <div class="flex flex-wrap items-center gap-2 w-full max-w-3xl justify-center">
            ${l4Header}
            <div class="flex items-center gap-1.5 p-2 rounded-lg border border-amber-500/30 bg-amber-950/20">
              <span class="text-[11px] font-mono text-amber-300">L5/L6:</span>
              ${rawPayloadHtml}
            </div>
          </div>
        </div>
      `;
    }

    if (step === 4) {
      const l3Header = `<div class="packet-block bg-sky-950/80 border border-sky-500/60 text-sky-200 px-4 py-3 rounded-lg font-mono text-sm shadow-md text-center">
        <span class="text-xs uppercase tracking-wider text-sky-400 block font-sans">${cfg.l3Proto} Header</span>
        IP: ${cfg.srcIp} → ${cfg.dstIp}
      </div>`;
      const l4Header = `<div class="packet-block bg-amber-950/80 border border-amber-500/60 text-amber-200 px-3 py-2 rounded-lg font-mono text-xs text-center">
        <span class="block text-amber-400 font-sans">${cfg.l4Proto} Hdr</span>
        :${cfg.dstPort}
      </div>`;
      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-sky-400 mb-2">LAYER 3: ${cfg.l3Proto.toUpperCase()} PACKET</div>
          <div class="flex flex-wrap items-center gap-2 w-full max-w-3xl justify-center">
            ${l3Header}
            <div class="flex items-center gap-1 p-2 rounded-lg border border-amber-500/30 bg-amber-950/20">
              ${l4Header}
              ${rawPayloadHtml}
            </div>
          </div>
        </div>
      `;
    }

    if (step === 5) {
      const l2Header = `<div class="packet-block bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 px-3 py-3 rounded-lg font-mono text-xs shadow-md text-center">
        <span class="text-xs uppercase tracking-wider text-emerald-400 block font-sans">Ethernet Header (14B)</span>
        MAC: ${cfg.srcMac.slice(-8)} → ${cfg.dstMac.slice(-8)}
      </div>`;
      const l3Header = `<div class="packet-block bg-sky-950/80 border border-sky-500/60 text-sky-200 px-2 py-2 rounded-lg font-mono text-xs text-center">
        <span class="block text-sky-400 font-sans">${cfg.l3Proto}</span>
        Hdr
      </div>`;
      const l4Header = `<div class="packet-block bg-amber-950/80 border border-amber-500/60 text-amber-200 px-2 py-2 rounded-lg font-mono text-xs text-center">
        <span class="block text-amber-400 font-sans">${cfg.l4Proto}</span>
        Hdr
      </div>`;
      const l2Trailer = `<div class="packet-block bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 px-3 py-3 rounded-lg font-mono text-xs shadow-lg text-center animate-pulse">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-300 block font-sans">★ FCS Trailer (4B)</span>
        CRC-32: 0x8F9A321E
      </div>`;

      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-emerald-400 mb-2">LAYER 2: ETHERNET FRAME (WITH FCS TRAILER)</div>
          <div class="flex flex-wrap items-center gap-2 w-full max-w-4xl justify-center">
            ${l2Header}
            <div class="flex items-center gap-1 p-2 rounded-lg border border-sky-500/30 bg-sky-950/20">
              ${l3Header}
              <div class="flex items-center gap-1 p-1 rounded-md border border-amber-500/20 bg-amber-950/20">
                ${l4Header}
                ${rawPayloadHtml}
              </div>
            </div>
            ${l2Trailer}
          </div>
          <div class="mt-4 text-xs font-sans text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-md text-center max-w-xl">
            Notice: The <strong>FCS Trailer</strong> is attached to the tail! It seals the entire frame with a hardware CRC check.
          </div>
        </div>
      `;
    }

    if (step === 6) {
      const bitSample = this.stringToBinary(cfg.payload);
      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-purple-400 mb-2">LAYER 1: PHYSICAL BITSTREAM TRANSMISSION</div>
          <div class="w-full max-w-3xl bg-black/60 p-4 rounded-lg border border-purple-500/40 text-purple-300 font-mono text-sm overflow-x-auto text-center tracking-widest shadow-inner">
            <div class="text-xs text-purple-400/70 mb-2">PREAMBLE + MAC HDR + IP HDR + L4 HDR + L5/L6 + PAYLOAD + FCS TRAILER AS SERIALIZED BITS:</div>
            <div class="py-2 text-purple-200 animate-pulse font-bold break-all">
              10101010 10101010 10101010 10101011 00111100 01010010 10000010 ... ${bitSample} ... 10001111 10011010 00110010 00011110
            </div>
            <div class="flex justify-center items-center gap-6 mt-3 text-xs text-slate-400">
              <span>⚡ Voltage: +0.85V / -0.85V (PAM-4)</span>
              <span>💡 Optical: 1310nm Laser Pulse</span>
              <span>📡 RF: 2.4/5GHz Phase Modulation</span>
            </div>
          </div>
        </div>
      `;
    }

    if (step === 7) {
      return `
        <div class="flex flex-col items-center p-6 bg-slate-900/60 rounded-xl border border-slate-800 w-full animate-fade-in">
          <div class="text-xs font-mono text-indigo-400 mb-2">COMPLETE 7-LAYER DECAPSULATION (RECEIVER STACK)</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl text-xs font-mono">
            <div class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300">
              <div class="font-bold mb-1">1. L2 Verified</div>
              <div>FCS CRC-32: PASS ✓</div>
              <div>MAC matches NIC. Headers & Trailer stripped!</div>
            </div>
            <div class="p-3 bg-sky-950/40 border border-sky-500/40 rounded-lg text-sky-300">
              <div class="font-bold mb-1">2. L3 Verified</div>
              <div>Dest IP: Matches host</div>
              <div>TTL decremented, IP header stripped!</div>
            </div>
            <div class="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-300">
              <div class="font-bold mb-1">3. L4 Demuxed</div>
              <div>Socket: :${cfg.dstPort}</div>
              <div>Seq/Ack checked, Transport header stripped!</div>
            </div>
            <div class="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300">
              <div class="font-bold mb-1">4. L5 Session Mapped</div>
              <div>Session Token: #0x82A1 Valid</div>
              <div>Dialogue state & sync points acknowledged!</div>
            </div>
            <div class="p-3 bg-teal-950/40 border border-teal-500/40 rounded-lg text-teal-300">
              <div class="font-bold mb-1">5. L6 Decrypted</div>
              <div>AEAD Tag: Valid ✓</div>
              <div>TLS record decrypted to UTF-8 application data!</div>
            </div>
            <div class="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-lg text-indigo-300">
              <div class="font-bold mb-1">6. L7 Delivered</div>
              <div>Process receives:</div>
              <div class="truncate text-white font-bold">"${safePayload}"</div>
            </div>
          </div>
        </div>
      `;
    }
  }
}

class TcpHandshakeSimulator {
  constructor() {
    this.step = 0;
    this.maxSteps = 6;
    this.clientState = "CLOSED";
    this.serverState = "LISTEN";
    this.clientSeq = 1000;
    this.serverSeq = 5000;
  }

  init() {
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    const nextBtn = document.getElementById("hs-next-btn");
    const resetBtn = document.getElementById("hs-reset-btn");
    if (nextBtn) nextBtn.addEventListener("click", () => this.nextStep());
    if (resetBtn) resetBtn.addEventListener("click", () => this.reset());
  }

  nextStep() {
    if (this.step < this.maxSteps) {
      this.step++;
      this.updateUI();
    }
  }

  reset() {
    this.step = 0;
    this.clientState = "CLOSED";
    this.serverState = "LISTEN";
    this.updateUI();
  }

  updateUI() {
    const s = this.step;
    const clientStateEl = document.getElementById("hs-client-state");
    const serverStateEl = document.getElementById("hs-server-state");
    const packetFlightEl = document.getElementById("hs-packet-flight");
    const statusTextEl = document.getElementById("hs-status-text");

    const states = [
      {
        cState: "CLOSED",
        sState: "LISTEN",
        flight: "Idle - Client socket unopened. Server listening on Port 80.",
        dir: "none",
        text: "Initial State: Server process is listening in <code>LISTEN</code> state. Client is in <code>CLOSED</code> state."
      },
      {
        cState: "SYN-SENT",
        sState: "LISTEN",
        flight: `Client → Server : [SYN] Seq=${this.clientSeq}, Ack=0 (Flags: SYN=1, ACK=0)`,
        dir: "c2s",
        text: "Handshake Step 1: Client initiates connection by picking Initial Sequence Number (ISN=1000), sending a <strong>[SYN]</strong> segment, and transitioning to <code>SYN-SENT</code>."
      },
      {
        cState: "SYN-SENT",
        sState: "SYN-RECEIVED",
        flight: `Server → Client : [SYN, ACK] Seq=${this.serverSeq}, Ack=${this.clientSeq + 1} (Flags: SYN=1, ACK=1)`,
        dir: "s2c",
        text: `Handshake Step 2: Server receives SYN, allocates buffers, picks its own ISN (${this.serverSeq}), increments client's sequence by 1 (Ack=${this.clientSeq + 1}), and returns <strong>[SYN, ACK]</strong>. Server enters <code>SYN-RECEIVED</code>.`
      },
      {
        cState: "ESTABLISHED",
        sState: "ESTABLISHED",
        flight: `Client → Server : [ACK] Seq=${this.clientSeq + 1}, Ack=${this.serverSeq + 1} (Flags: ACK=1)`,
        dir: "c2s",
        text: `Handshake Step 3: Client acknowledges server's SYN by returning <strong>[ACK]</strong> with Ack=${this.serverSeq + 1}. Both endpoints are now in <code>ESTABLISHED</code> state! Connection ready for full-duplex payload transmission.`
      },
      {
        cState: "ESTABLISHED",
        sState: "ESTABLISHED",
        flight: `Client → Server : [PSH, ACK] Seq=${this.clientSeq + 1}, Ack=${this.serverSeq + 1} (Payload: 24 bytes HTTP GET)`,
        dir: "c2s",
        text: "Data Transfer: Client sends HTTP request payload. TCP tracks byte counts: next packet from client will advance Seq by the exact number of payload bytes."
      },
      {
        cState: "FIN-WAIT-1",
        sState: "CLOSE-WAIT",
        flight: `Client → Server : [FIN, ACK] Seq=${this.clientSeq + 25}, Ack=${this.serverSeq + 1}`,
        dir: "c2s",
        text: "Graceful Teardown Step 1: Client finishes sending data, sends <strong>[FIN]</strong> segment, and enters <code>FIN-WAIT-1</code>. Server sends ACK and enters <code>CLOSE-WAIT</code>."
      },
      {
        cState: "TIME-WAIT (2MSL)",
        sState: "CLOSED",
        flight: `Server → Client [FIN] & Client → Server [ACK]`,
        dir: "both",
        text: "Graceful Teardown Step 2: Server sends its own FIN. Client replies with ACK and stays in <code>TIME-WAIT</code> (2MSL = typically 60-120s) to guarantee server received the ACK and prevent delayed duplicate packets from confusing future sockets."
      }
    ];

    const cur = states[s];
    const stepBadgeEl = document.getElementById("hs-step-badge");
    if (clientStateEl) clientStateEl.textContent = cur.cState;
    if (serverStateEl) serverStateEl.textContent = cur.sState;
    if (statusTextEl) statusTextEl.innerHTML = cur.text;
    if (stepBadgeEl) {
      stepBadgeEl.textContent = `Stage ${s} / ${this.maxSteps} : ${s === 0 ? "Initial Idle" : (s <= 3 ? "3-Way Handshake" : (s === 4 ? "Data Payload Transfer" : "Graceful Teardown"))}`;
    }

    if (packetFlightEl) {
      let icon = "⟷";
      let color = "text-slate-400";
      if (cur.dir === "c2s") {
        icon = "──▶";
        color = "text-amber-400";
      } else if (cur.dir === "s2c") {
        icon = "◀──";
        color = "text-sky-400";
      } else if (cur.dir === "both") {
        icon = "◀──▶";
        color = "text-emerald-400";
      }

      packetFlightEl.innerHTML = `
        <div class="flex items-center justify-center gap-3 font-mono text-sm ${color} animate-fade-in">
          <span class="text-lg font-bold">${icon}</span>
          <span class="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-md">${cur.flight}</span>
        </div>
      `;
    }
  }
}
