# OSI 7-Layer Interactive Protocol Suite

A comprehensive, zero-dependency educational laboratory and reference application covering the complete **7-Layer OSI Model** (Physical through Application), developed for computer networks curricula (CSCI 250) and systems engineering.

## 🌟 Suite Capabilities

1. **7 Layers Architectural Explorer:** Deep dives across all 7 layers (PDU taxonomy, mnemonics, physical hardware, dialogue control, checkpointing, syntax serialization, and application architectures).
2. **Bit-by-Bit Header & Trailer Inspector:** Interactive bitfield visualizer with exact field offsets, descriptions, and binary representations across Layers 2–7:
   - Layer 2: Ethernet II (with 4-byte FCS CRC-32 Trailer), ARP
   - Layer 3: IPv4, IPv6, ICMP
   - Layer 4: TCP Segment, UDP Datagram
   - Layer 6: TLS 1.3 Record Layer (AEAD encrypted payload + 16-byte tag)
   - Layer 7: HTTP/2 Binary Framing, DNS Message Format, DHCP / BOOTP
3. **Interactive 7-Step Encapsulation & Decapsulation Lab:** Live step-by-step pipeline demonstrating:
   - L7 Application Payload (SDU)
   - L6 Presentation Formatting & TLS 1.3 AEAD encryption
   - L5 Session Dialogue tracking, sync points, and tokens
   - L4 Transport Segment/Datagram port bindings
   - L3 Network IP packet encapsulation
   - L2 Data Link Frame with FCS CRC-32 Trailer
   - L1 Physical bitstream serialization
   - Full reverse decapsulation and verification
4. **TCP 3-Way Handshake & Teardown Simulator:** Sequence/Ack tracking, SYN/ACK/FIN flag inspection, and socket state machine transitions.
5. **Subnet & IPv6 EUI-64 Calculators:** CIDR calculations, RFC 1918 scope identification, and EUI-64 link-local address generation with 7th-bit inversion.
6. **CSCI 250 CLI Diagnostics Terminal:** In-browser terminal simulating `ping`, `ifconfig`, `ip a`, `ipconfig /all`, `nslookup`, `dig`, `arp -a`, `ss`, `netstat`, `traceroute`, `curl`, `openssl s_client`, `dhclient -v`, and `ssh`.
7. **30-Question Assessment Quiz:** Interactive quiz bank curated from curriculum homeworks, lab assignments, and exam review guides.
8. **Publication-Grade 10-Chapter Guide (PDF):** Standalone printable reference guide (`OSI_Complete_7_Layer_Guide.pdf`).

## 🚀 Running Locally

The suite is built with vanilla HTML5, CSS3, and modern JavaScript (ES6+). No build steps, bundlers, or server dependencies are required.

Open `index.html` directly in any modern browser:

```bash
xdg-open index.html
# or with python static server
python3 -m http.server 8080
```

## 📄 Documentation

The complete 10-chapter technical reference is included as both HTML (`guide.html`) and PDF (`OSI_Complete_7_Layer_Guide.pdf`).
