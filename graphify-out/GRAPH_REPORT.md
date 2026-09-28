# Graph Report - osi-interactive-suite  (2026-09-28)

## Corpus Check
- 5 files · ~12,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 52 nodes · 81 edges · 7 communities (1 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `615e767c`
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

## God Nodes (most connected - your core abstractions)
1. `PacketSimulator` - 13 edges
2. `TcpHandshakeSimulator` - 7 edges
3. `TerminalSimulator` - 7 edges
4. `NetworkTools` - 6 edges
5. `initHeaderInspector()` - 3 edges
6. `initNetworkTools()` - 3 edges
7. `initLayerExplorer()` - 2 edges
8. `renderInspector()` - 2 edges
9. `showFieldDetail()` - 2 edges
10. `initQuiz()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (7 total, 6 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.18
Nodes (6): initHeaderInspector(), renderInspector(), showFieldDetail(), initLayerExplorer(), initNetworkTools(), initQuiz()

## Knowledge Gaps
- **3 isolated node(s):** `HEADER_SPECS`, `LAYER_DETAILS`, `QUIZ_QUESTIONS`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 14 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PacketSimulator` connect `PacketSimulator` to `.updateUI`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `TerminalSimulator` connect `TerminalSimulator` to `NetworkTools`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `HEADER_SPECS`, `LAYER_DETAILS`, `QUIZ_QUESTIONS` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._