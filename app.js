/**
 * OSI Interactive Suite - Main Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize navigation tabs
  initNavTabs();

  // Initialize Layer Explorer
  initLayerExplorer();

  // Initialize Header Inspector
  initHeaderInspector();

  // Initialize Simulators
  const packetSim = new PacketSimulator();
  packetSim.init();

  const tcpSim = new TcpHandshakeSimulator();
  tcpSim.init();

  // Initialize Tools
  initNetworkTools();

  // Initialize Terminal
  const termSim = new TerminalSimulator("terminal-output", "terminal-input");
  termSim.init();

  // Initialize Quiz
  initQuiz();
});

function initNavTabs() {
  const tabs = document.querySelectorAll(".nav-tab-btn");
  const views = document.querySelectorAll(".view-section");

  function switchView(targetId) {
    tabs.forEach(t => {
      if (t.dataset.target === targetId) {
        t.classList.add("active");
        t.classList.remove("text-slate-400", "border-transparent");
      } else {
        t.classList.remove("active");
        t.classList.add("text-slate-400", "border-transparent");
      }
    });

    views.forEach(v => {
      if (v.id === targetId) {
        v.classList.remove("hidden");
      } else {
        v.classList.add("hidden");
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;
      window.location.hash = targetId;
      switchView(targetId);
    });
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(hash)) {
      switchView(hash);
    }
  });

  // Activate initial view from hash if present
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById(initialHash)) {
    switchView(initialHash);
  }
}

function initLayerExplorer() {
  const layerPills = document.querySelectorAll(".layer-pill");
  let currentLayer = 1;

  function renderLayer(layerNum) {
    currentLayer = layerNum;
    const l = LAYER_DETAILS[layerNum];
    if (!l) return;

    // Update pill styles
    layerPills.forEach(pill => {
      const num = parseInt(pill.dataset.layer, 10);
      if (num === layerNum) {
        pill.className = `layer-pill px-4 py-2 rounded-xl text-sm font-semibold transition border shadow-lg bg-slate-800 text-white border-${l.accent}-500`;
      } else {
        pill.className = `layer-pill px-4 py-2 rounded-xl text-sm font-semibold transition border border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white`;
      }
    });

    const displayContainer = document.getElementById("layer-detail-container");
    if (!displayContainer) return;

    let subHtml = "";
    if (layerNum === 1) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-purple-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Physical Signaling & Media</h4>
            <p class="text-xs text-slate-300 leading-relaxed">${l.deepDive.signaling}</p>
            <div class="mt-4 p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg text-xs font-mono text-purple-300">
              ${l.deepDive.pduExplanation}
            </div>
          </div>
          <div class="bg-slate-900/80 border border-purple-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Physical Topologies & Standards</h4>
            <ul class="text-xs space-y-2 text-slate-300">
              ${l.deepDive.topologies.map(t => `<li><strong class="text-white">${t.name}:</strong> ${t.desc}</li>`).join("")}
            </ul>
            <div class="mt-3 text-xs text-slate-400 border-t border-slate-800 pt-2">
              <strong class="text-purple-300">Cabling:</strong> ${l.deepDive.cablingStandards}
            </div>
          </div>
        </div>
      `;
    } else if (layerNum === 2) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">MAC Hardware Addressing</h4>
            <p class="text-xs text-slate-300 leading-relaxed">${l.deepDive.macAddressing}</p>
            <div class="mt-3 space-y-1.5">
              ${l.deepDive.addressTypes.map(a => `
                <div class="text-xs bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span class="font-bold text-emerald-400">${a.type}:</span> <code class="text-white">${a.example}</code> - <span class="text-slate-400">${a.desc}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Switching & The FCS Trailer</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">${l.deepDive.switchOperation}</p>
            <div class="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs text-emerald-200">
              <strong class="text-emerald-300 block mb-1">★ Why only Layer 2 has a Trailer:</strong>
              ${l.deepDive.trailerDeepDive}
            </div>
          </div>
        </div>
      `;
    } else if (layerNum === 3) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-sky-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-sky-400 uppercase tracking-wider mb-2">IPv4 Classful & Special Ranges</h4>
            <div class="overflow-x-auto text-xs font-mono">
              <table class="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-sky-400">
                    <th class="py-1">Class</th>
                    <th class="py-1">Range</th>
                    <th class="py-1">Default Mask</th>
                    <th class="py-1">Hosts</th>
                  </tr>
                </thead>
                <tbody>
                  ${l.deepDive.ipv4Classes.map(c => `
                    <tr class="border-b border-slate-800">
                      <td class="py-1 font-bold text-white">${c.class}</td>
                      <td class="py-1 text-slate-400">${c.range}</td>
                      <td class="py-1">${c.defaultMask}</td>
                      <td class="py-1 text-sky-300">${c.hostsPerNet}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            <div class="mt-3 text-xs text-slate-300">
              <strong class="text-sky-300">RFC 1918 Private Ranges:</strong>
              <div class="text-slate-400 text-xs mt-1">10.0.0.0/8 • 172.16.0.0/12 • 192.168.0.0/16 • APIPA: 169.254.0.0/16</div>
            </div>
          </div>
          <div class="bg-slate-900/80 border border-sky-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-sky-400 uppercase tracking-wider mb-2">IPv6 Architecture & Scopes</h4>
            <p class="text-xs text-slate-300 mb-3">128-bit addresses (3.4 × 10^38), 8 hexadecimal blocks. Zero-compression with <code>::</code> once.</p>
            <div class="space-y-1.5 text-xs">
              ${l.deepDive.ipv6Types.map(t => `
                <div class="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span class="font-bold text-sky-300">${t.type}</span> (<code class="text-amber-400">${t.prefix}</code>):
                  <span class="text-slate-400">${t.desc}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Chapter 4: Routing Architecture & Dynamic Protocols -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-slate-900/80 border border-sky-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-sky-400 uppercase tracking-wider mb-2">Routing Architecture & Multilayer Switching</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">${l.deepDive.routingArchitecture.layer3SwitchVsRouter}</p>
            <div class="space-y-2 text-xs">
              ${l.deepDive.routingArchitecture.routerRoles.map(r => `
                <div class="bg-slate-950/60 p-2 rounded border border-slate-800">
                  <strong class="text-white">${r.role}:</strong> <span class="text-slate-400">${r.desc}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="bg-slate-900/80 border border-sky-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-sky-400 uppercase tracking-wider mb-2">Dynamic Routing Protocols (IGP vs. EGP)</h4>
            <div class="overflow-x-auto text-xs">
              <table class="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-sky-400">
                    <th class="py-1">Protocol</th>
                    <th class="py-1">Scope</th>
                    <th class="py-1">Algorithm</th>
                    <th class="py-1">Metric</th>
                  </tr>
                </thead>
                <tbody>
                  ${l.deepDive.routingArchitecture.routingProtocols.map(p => `
                    <tr class="border-b border-slate-800">
                      <td class="py-1 font-bold text-white">${p.name}</td>
                      <td class="py-1 text-amber-300">${p.type}</td>
                      <td class="py-1 text-slate-400">${p.algorithm}</td>
                      <td class="py-1 text-emerald-400">${p.metric}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            <div class="mt-3 text-[11px] text-slate-400">
              <strong class="text-sky-300">Administrative Distance (AD):</strong> Connected=0, Static=1, eBGP=20, EIGRP=90, OSPF=110, RIP=120. (Lower is preferred).
            </div>
          </div>
        </div>
      `;
    } else if (layerNum === 4) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">Ports & Socket Composition</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">${l.deepDive.socketConcept}</p>
            <div class="space-y-2">
              ${l.deepDive.portRanges.map(p => `
                <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div class="font-bold text-amber-300">${p.name} (${p.range})</div>
                  <div class="text-slate-400 mt-0.5">${p.desc}</div>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">TCP vs. UDP Deep Comparison</h4>
            <div class="overflow-x-auto text-xs">
              <table class="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-amber-400">
                    <th class="py-1">Feature</th>
                    <th class="py-1">TCP</th>
                    <th class="py-1">UDP</th>
                  </tr>
                </thead>
                <tbody>
                  ${l.deepDive.tcpVsUdp.map(r => `
                    <tr class="border-b border-slate-800">
                      <td class="py-1 font-bold text-white">${r.metric}</td>
                      <td class="py-1 text-emerald-400">${r.tcp}</td>
                      <td class="py-1 text-sky-400">${r.udp}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (layerNum === 5) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-rose-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-rose-400 uppercase tracking-wider mb-2">Dialogue Transmission Modes</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">Controls the transmission directionality and turn-taking rules across endpoints.</p>
            <div class="space-y-2">
              ${l.deepDive.dialogueModes.map(d => `
                <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div class="font-bold text-rose-300">${d.mode}</div>
                  <div class="text-slate-400 mt-0.5">${d.description}</div>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="bg-slate-900/80 border border-rose-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-rose-400 uppercase tracking-wider mb-2">Checkpoint Synchronization & Token Control</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">${l.deepDive.checkpoints}</p>
            <div class="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs text-rose-200 mb-3">
              <strong class="text-rose-300 block mb-1">★ Software Token Management:</strong>
              ${l.deepDive.tokenManagement}
            </div>
            <div class="text-xs text-slate-300">
              <strong class="text-rose-300">Modern Internet Evolution:</strong>
              <div class="text-slate-400 text-xs mt-1">${l.deepDive.modernRelevance}</div>
            </div>
          </div>
        </div>
        <div class="mt-4 bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 shadow-lg">
          <h4 class="text-sm font-bold text-rose-400 uppercase tracking-wider mb-2">Primary Session Layer Protocols</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${l.deepDive.keyProtocols.map(p => `
              <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span class="font-bold text-white">${p.name}:</span>
                <span class="text-slate-400 ml-1">${p.role}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    } else if (layerNum === 6) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-teal-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">Abstract vs. Transfer Syntax</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">${l.deepDive.syntaxConcepts}</p>
            <div class="p-3 bg-teal-950/30 border border-teal-500/30 rounded-lg text-xs text-teal-200 mb-3">
              <strong class="text-teal-300 block mb-1">★ Endianness & Network Byte Order:</strong>
              ${l.deepDive.endianness}
            </div>
            <div class="text-xs text-slate-300">
              <strong class="text-teal-300">Character Set Standardization:</strong>
              <div class="text-slate-400 text-xs mt-1">${l.deepDive.characterEncoding}</div>
            </div>
          </div>
          <div class="bg-slate-900/80 border border-teal-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">Data Serialization & Encoding Comparison</h4>
            <div class="overflow-x-auto text-xs">
              <table class="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-teal-400">
                    <th class="py-1">Format</th>
                    <th class="py-1">Encoding</th>
                    <th class="py-1">Efficiency</th>
                    <th class="py-1">Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  ${l.deepDive.serializationMatrix.map(s => `
                    <tr class="border-b border-slate-800">
                      <td class="py-1 font-bold text-white">${s.format}</td>
                      <td class="py-1 text-slate-400">${s.encoding}</td>
                      <td class="py-1 text-teal-300">${s.efficiency}</td>
                      <td class="py-1 text-slate-300">${s.useCase}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            <div class="mt-4 p-3 bg-teal-950/20 border border-teal-500/20 rounded-lg text-xs text-slate-300">
              <strong class="text-teal-300 block mb-1">Cryptographic Presentation (TLS 1.3):</strong>
              ${l.deepDive.cryptoPresentation}
            </div>
          </div>
        </div>
      `;
    } else if (layerNum === 7) {
      subHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Web Protocol Evolution Matrix</h4>
            <div class="overflow-x-auto text-xs">
              <table class="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-indigo-400">
                    <th class="py-1">Version</th>
                    <th class="py-1">Transport</th>
                    <th class="py-1">Framing & Mux</th>
                    <th class="py-1">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  ${l.deepDive.httpEvolution.map(h => `
                    <tr class="border-b border-slate-800">
                      <td class="py-1 font-bold text-white">${h.version}</td>
                      <td class="py-1 text-amber-300">${h.transport}</td>
                      <td class="py-1 text-slate-300">${h.mux}</td>
                      <td class="py-1 text-indigo-300">${h.handshake}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            <div class="mt-4 text-xs text-slate-300">
              <strong class="text-indigo-300 block mb-1">Hierarchical DNS Resolution Architecture:</strong>
              <p class="text-slate-400 leading-relaxed">${l.deepDive.dnsArchitecture}</p>
            </div>
          </div>
          <div class="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
            <h4 class="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">DHCP DORA 4-Way Transaction</h4>
            <div class="space-y-2 mb-4">
              ${l.deepDive.dhcpDora.map(d => `
                <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-indigo-300">${d.step}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${d.type}</span>
                  </div>
                  <div class="text-slate-400 mt-1">${d.desc}</div>
                </div>
              `).join("")}
            </div>
            <div class="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-xs text-slate-300">
              <strong class="text-indigo-300 block mb-1">Email Push & Pull Store-and-Forward:</strong>
              <p class="text-slate-400 leading-relaxed">${l.deepDive.emailArchitecture}</p>
            </div>
          </div>
        </div>
      `;
    }

    displayContainer.innerHTML = `
      <div class="bg-slate-900/90 border border-${l.accent}-500/40 rounded-2xl p-6 shadow-xl animate-fade-in">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span class="px-3 py-1 text-xs font-mono font-bold rounded-full bg-${l.accent}-500/20 text-${l.accent}-400 border border-${l.accent}-500/30">
              LAYER ${l.num} : ${l.name.toUpperCase()}
            </span>
            <h3 class="text-xl font-bold text-white mt-2">${l.name}</h3>
          </div>
          <div class="flex flex-wrap gap-2 text-xs font-mono">
            <div class="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span class="text-slate-500">PDU:</span> <strong class="text-white">${l.pdu}</strong> <span class="text-amber-300/90 font-semibold">(${l.pduMnemonic})</span>
            </div>
            <div class="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <span class="text-slate-500">Layer Mnemonic:</span> <strong class="text-amber-400">${l.mnemonic}</strong>
            </div>
          </div>
        </div>

        <p class="text-sm text-slate-300 mt-4 leading-relaxed">${l.summary}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
            <span class="text-slate-500 block uppercase font-bold mb-1">Key Protocols</span>
            <span class="text-slate-200 font-mono">${l.protocols}</span>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
            <span class="text-slate-500 block uppercase font-bold mb-1">Associated Hardware</span>
            <span class="text-slate-200">${l.hardware}</span>
          </div>
        </div>

        ${subHtml}
      </div>
    `;
  }

  layerPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const num = parseInt(pill.dataset.layer, 10);
      renderLayer(num);
    });
  });

  renderLayer(1);
}

function initHeaderInspector() {
  const protoBtns = document.querySelectorAll(".proto-btn");
  let currentProto = "ethernet";

  function renderInspector(protoKey) {
    currentProto = protoKey;
    const spec = HEADER_SPECS[protoKey];
    if (!spec) return;

    protoBtns.forEach(btn => {
      if (btn.dataset.proto === protoKey) {
        btn.className = "proto-btn px-4 py-2 rounded-xl text-sm font-semibold transition border border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-md";
      } else {
        btn.className = "proto-btn px-4 py-2 rounded-xl text-sm font-semibold transition border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white";
      }
    });

    const gridContainer = document.getElementById("header-grid-container");
    const detailPanel = document.getElementById("field-detail-panel");
    const headerTitle = document.getElementById("header-spec-title");
    const headerDesc = document.getElementById("header-spec-desc");
    const trailerNotice = document.getElementById("trailer-special-notice");

    if (headerTitle) headerTitle.textContent = spec.name;
    if (headerDesc) headerDesc.textContent = spec.description;

    if (trailerNotice) {
      if (spec.trailerExplanation) {
        trailerNotice.classList.remove("hidden");
        trailerNotice.innerHTML = `
          <div class="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
            <strong class="text-emerald-300 text-sm block mb-1">★ ${spec.trailerExplanation.title}</strong>
            <p class="leading-relaxed text-slate-300">${spec.trailerExplanation.content}</p>
          </div>
        `;
      } else {
        trailerNotice.classList.add("hidden");
      }
    }

    if (gridContainer) {
      let fieldsHtml = "";
      spec.fields.forEach((field, index) => {
        const isTrailer = field.isTrailer;
        const colorClass = isTrailer
          ? "border-emerald-400 bg-emerald-950/80 text-emerald-200 hover:border-emerald-300 ring-2 ring-emerald-500/30"
          : "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-indigo-400 hover:bg-slate-700/80";

        fieldsHtml += `
          <div class="header-field-card cursor-pointer p-3 rounded-lg border ${colorClass} transition duration-150 flex flex-col justify-between" data-index="${index}">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-mono font-bold ${isTrailer ? "text-emerald-300" : "text-indigo-400"}">${field.bits || field.bytes + " bytes"}</span>
                ${isTrailer ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">TRAILER</span>' : ""}
              </div>
              <div class="font-semibold text-xs text-white leading-tight">${field.name}</div>
            </div>
            <div class="text-[11px] text-slate-400 font-mono mt-2 truncate">${field.defaultValue || field.hex || field.purpose || ""}</div>
          </div>
        `;
      });

      gridContainer.innerHTML = fieldsHtml;

      const fieldCards = gridContainer.querySelectorAll(".header-field-card");
      fieldCards.forEach(card => {
        card.addEventListener("click", () => {
          fieldCards.forEach(c => c.classList.remove("ring-2", "ring-indigo-500"));
          card.classList.add("ring-2", "ring-indigo-500");
          const idx = parseInt(card.dataset.index, 10);
          showFieldDetail(spec.fields[idx], spec);
        });
      });

      // Show first field by default
      if (spec.fields.length > 0) {
        fieldCards[0].classList.add("ring-2", "ring-indigo-500");
        showFieldDetail(spec.fields[0], spec);
      }
    }
  }

  function showFieldDetail(field, spec) {
    const detailPanel = document.getElementById("field-detail-panel");
    if (!detailPanel) return;

    let flagSection = "";
    if (field.flagList) {
      flagSection = `
        <div class="mt-4 border-t border-slate-800 pt-3">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">9-Bit Control Flags Breakdown</span>
          <div class="grid grid-cols-2 gap-2 text-xs">
            ${field.flagList.map(f => `
              <div class="bg-slate-950/70 p-2 rounded border border-slate-800">
                <strong class="text-white font-mono">${f.name}:</strong> <span class="text-slate-400">${f.desc}</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    detailPanel.innerHTML = `
      <div class="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 shadow-xl animate-fade-in">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span class="text-xs font-mono uppercase text-indigo-400 font-bold">${spec.name}</span>
            <h4 class="text-lg font-bold text-white mt-1">${field.name}</h4>
          </div>
          <div class="text-right">
            <span class="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
              ${field.bits || field.bytes + " bytes"}
            </span>
            <div class="text-[11px] font-mono text-slate-500 mt-1">${field.offset || ""}</div>
          </div>
        </div>

        <p class="text-xs text-slate-300 mt-3 leading-relaxed">${field.desc}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs font-mono">
          <div class="p-2.5 bg-slate-950/60 rounded border border-slate-800">
            <span class="text-slate-500 block text-[10px] uppercase font-sans">Bit / Byte Offset</span>
            <span class="text-indigo-300">${field.offset || "N/A"}</span>
          </div>
          <div class="p-2.5 bg-slate-950/60 rounded border border-slate-800">
            <span class="text-slate-500 block text-[10px] uppercase font-sans">Typical / Default Value</span>
            <span class="text-emerald-300">${field.defaultValue || field.hex || "Variable"}</span>
          </div>
        </div>

        ${field.anatomy ? `
          <div class="mt-3 p-2.5 bg-slate-950/40 border border-slate-800 rounded text-xs text-slate-400">
            <strong class="text-slate-300">Anatomy:</strong> ${field.anatomy}
          </div>
        ` : ""}

        ${flagSection}
      </div>
    `;
  }

  protoBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      renderInspector(btn.dataset.proto);
    });
  });

  renderInspector("ethernet");
}

function initNetworkTools() {
  // Subnet Calculator
  const calcBtn = document.getElementById("calc-submit-btn");
  const ipInput = document.getElementById("calc-ip-input");
  const cidrInput = document.getElementById("calc-cidr-input");
  const resultContainer = document.getElementById("calc-result-container");

  function runCalc() {
    if (!ipInput || !cidrInput || !resultContainer) return;
    const res = NetworkTools.calculateSubnet(ipInput.value, cidrInput.value);
    if (res.error) {
      resultContainer.innerHTML = `<div class="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300">${res.error}</div>`;
      return;
    }

    resultContainer.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Network ID</span>
          <span class="text-white font-bold">${res.networkId} ${res.cidr}</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Subnet Mask</span>
          <span class="text-sky-400">${res.subnetMask}</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Broadcast Address</span>
          <span class="text-amber-400">${res.broadcastAddress}</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Usable Host Range</span>
          <span class="text-emerald-400">${res.usableRange}</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Total Addresses</span>
          <span class="text-slate-200">${res.totalAddresses}</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Usable Hosts</span>
          <span class="text-emerald-300 font-bold">${res.usableHosts}</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Class & Default</span>
          <span class="text-purple-300">${res.ipClass} (${res.defaultMask})</span>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span class="text-slate-500 block text-[10px] font-sans">Address Scope</span>
          <span class="text-teal-300 font-bold">${res.scope}</span>
        </div>
      </div>
    `;
  }

  if (calcBtn) calcBtn.addEventListener("click", runCalc);

  // EUI-64 Generator
  const euiBtn = document.getElementById("eui-submit-btn");
  const macInput = document.getElementById("eui-mac-input");
  const euiResult = document.getElementById("eui-result-container");

  function runEui() {
    if (!macInput || !euiResult) return;
    const res = NetworkTools.generateEui64(macInput.value);
    if (res.error) {
      euiResult.innerHTML = `<div class="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300">${res.error}</div>`;
      return;
    }

    euiResult.innerHTML = `
      <div class="space-y-3 text-xs font-mono">
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div class="text-slate-500 text-[10px] font-sans mb-1">Step 1: Insert 0xFFFE in center of 48-bit MAC</div>
          <div class="text-sky-300">${res.step1Insert}</div>
        </div>
        <div class="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div class="text-slate-500 text-[10px] font-sans mb-1">Step 2: Invert Bit 7 (Universal/Local bit of first octet)</div>
          <div class="text-amber-300">${res.step2InvertBit7}</div>
        </div>
        <div class="p-3 bg-slate-950/60 border border-emerald-500/40 rounded-lg">
          <div class="text-slate-500 text-[10px] font-sans mb-1">Step 3: Prepend Link-Local Prefix fe80::/64</div>
          <div class="text-emerald-400 font-bold">${res.compressedLinkLocal}</div>
          <div class="text-slate-500 text-[11px] mt-1">Full: ${res.fullLinkLocal}</div>
        </div>
      </div>
    `;
  }

  if (euiBtn) euiBtn.addEventListener("click", runEui);

  // Run initial calculations
  runCalc();
  runEui();
}

function initQuiz() {
  const container = document.getElementById("quiz-container");
  if (!container) return;

  let currentIdx = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    if (currentIdx >= QUIZ_QUESTIONS.length) {
      container.innerHTML = `
        <div class="text-center p-8 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl">
          <div class="text-4xl mb-3">🎓</div>
          <h3 class="text-2xl font-bold text-white mb-2">CSCI 250 OSI Exam Prep Completed!</h3>
          <p class="text-base text-slate-300 mb-4">Your Score: <strong class="text-emerald-400 font-mono text-xl">${score} / ${QUIZ_QUESTIONS.length}</strong> (${Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)</p>
          <button id="quiz-restart-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition">
            Retake Assessment
          </button>
        </div>
      `;
      document.getElementById("quiz-restart-btn").addEventListener("click", () => {
        currentIdx = 0;
        score = 0;
        renderQuestion();
      });
      return;
    }

    const q = QUIZ_QUESTIONS[currentIdx];
    answered = false;

    container.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-fade-in">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-indigo-400 border border-slate-700">
            Question ${currentIdx + 1} of ${QUIZ_QUESTIONS.length}
          </span>
          <span class="text-xs font-mono text-slate-500">Layer ${q.layer} Concept</span>
        </div>

        <h4 class="text-base font-semibold text-white leading-relaxed mb-6">${q.question}</h4>

        <div class="space-y-3" id="quiz-options-container">
          ${q.options.map((opt, i) => `
            <button class="quiz-option-btn w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500 hover:bg-slate-800/60 text-slate-300 text-xs font-mono transition flex items-center justify-between" data-index="${i}">
              <span><strong class="text-slate-500 mr-2">[${String.fromCharCode(65 + i)}]</strong> ${opt}</span>
              <span class="status-icon"></span>
            </button>
          `).join("")}
        </div>

        <div id="quiz-feedback-box" class="mt-5 hidden p-4 rounded-xl text-xs leading-relaxed"></div>

        <div class="flex justify-end mt-6">
          <button id="quiz-next-btn" class="hidden px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition">
            Next Question →
          </button>
        </div>
      </div>
    `;

    const optionBtns = container.querySelectorAll(".quiz-option-btn");
    const feedbackBox = document.getElementById("quiz-feedback-box");
    const nextBtn = document.getElementById("quiz-next-btn");

    optionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;

        const selectedIdx = parseInt(btn.dataset.index, 10);
        const isCorrect = selectedIdx === q.answer;

        if (isCorrect) {
          score++;
          btn.className = "quiz-option-btn w-full text-left p-3.5 rounded-xl border border-emerald-500 bg-emerald-950/50 text-emerald-200 text-xs font-mono flex items-center justify-between";
          btn.querySelector(".status-icon").innerHTML = "✓ Correct";
        } else {
          btn.className = "quiz-option-btn w-full text-left p-3.5 rounded-xl border border-rose-500 bg-rose-950/50 text-rose-200 text-xs font-mono flex items-center justify-between";
          btn.querySelector(".status-icon").innerHTML = "✗ Incorrect";

          // Highlight correct answer
          optionBtns[q.answer].className = "quiz-option-btn w-full text-left p-3.5 rounded-xl border border-emerald-500/70 bg-emerald-950/30 text-emerald-300 text-xs font-mono flex items-center justify-between";
          optionBtns[q.answer].querySelector(".status-icon").innerHTML = "✓ Correct Answer";
        }

        feedbackBox.classList.remove("hidden");
        feedbackBox.className = `mt-5 p-4 rounded-xl text-xs leading-relaxed border ${isCorrect ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200" : "bg-rose-950/40 border-rose-500/40 text-rose-200"}`;
        feedbackBox.innerHTML = `<strong class="block mb-1 font-bold text-sm">${isCorrect ? "Excellent!" : "Explanation:"}</strong>${q.explanation}`;

        nextBtn.classList.remove("hidden");
      });
    });

    nextBtn.addEventListener("click", () => {
      currentIdx++;
      renderQuestion();
    });
  }

  renderQuestion();
}
