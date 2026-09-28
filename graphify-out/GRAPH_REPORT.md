# Graph Report - osi-interactive-suite  (2026-09-28)

## Corpus Check
- 6 files · ~24,042 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 59 nodes · 88 edges · 8 communities (2 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `653b7153`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- .updateUI
- PacketSimulator
- NetworkTools
- TerminalSimulator
- headers-data.js
- quiz-data.js
- OSI 7-Layer Interactive Protocol Suite

## God Nodes (most connected - your core abstractions)
1. `PacketSimulator` - 14 edges
2. `TcpHandshakeSimulator` - 7 edges
3. `TerminalSimulator` - 7 edges
4. `NetworkTools` - 6 edges
5. `OSI 7-Layer Interactive Protocol Suite` - 4 edges
6. `initHeaderInspector()` - 3 edges
7. `initNetworkTools()` - 3 edges
8. `initNavTabs()` - 2 edges
9. `initLayerExplorer()` - 2 edges
10. `renderInspector()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (8 total, 6 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.17
Nodes (7): initHeaderInspector(), renderInspector(), showFieldDetail(), initLayerExplorer(), initNavTabs(), initNetworkTools(), initQuiz()

### Community 7 - "OSI 7-Layer Interactive Protocol Suite"
Cohesion: 0.40
Nodes (4): 📄 Documentation, OSI 7-Layer Interactive Protocol Suite, 🚀 Running Locally, 🌟 Suite Capabilities

## Knowledge Gaps
- **6 isolated node(s):** `HEADER_SPECS`, `LAYER_DETAILS`, `QUIZ_QUESTIONS`, `🌟 Suite Capabilities`, `🚀 Running Locally` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 18 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PacketSimulator` connect `PacketSimulator` to `.updateUI`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `TerminalSimulator` connect `TerminalSimulator` to `NetworkTools`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `HEADER_SPECS`, `LAYER_DETAILS`, `QUIZ_QUESTIONS` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._