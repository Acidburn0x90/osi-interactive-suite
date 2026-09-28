/**
 * OSI Interactive Suite - Full Frame Visualizer & Architectural Summary Engine
 * Provides an interactive end-to-end wire buffer anatomy, layer drilldowns,
 * live efficiency metrics, and cross-suite navigation.
 */

class FullFrameVisualizer {
  constructor() {
    this.currentScenario = "https";
    this.selectedSegment = "tcp";
    this.customPayload = "GET /index.html HTTP/1.1";
    this.customL4 = "TCP";
    this.customL3 = "IPv4";

    this.scenarios = {
      https: {
        id: "https",
        title: "HTTPS Web Request (TLS 1.3 + TCP + IPv4)",
        category: "Web & Security",
        summary: "The standard modern web transaction: an HTTP application request encrypted within a TLS 1.3 AEAD record, segmented by TCP with flow control, routed across IPv4, and framed into Ethernet II with hardware CRC-32.",
        l3: "IPv4",
        l4: "TCP",
        payloadStr: "GET /index.html HTTP/1.1\r\nHost: example.edu",
        segments: [
          {
            key: "preamble",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Preamble & Start Frame Delimiter (SFD)",
            bytes: 8,
            offset: "Wire Offset: -8 to -1 (Physical Header)",
            pdu: "Bits / Symbols",
            role: "Provides receiver bit-clock synchronization (56 alternating bits 10101010...) followed by the 1-byte SFD (10101011) signalling that the Ethernet frame begins immediately with the destination MAC address.",
            hardware: "Transceiver PHY chip (1000BASE-T, SFP+, RJ-45 magnetics). Stripped by PHY before frame reaches MAC controller.",
            fields: [
              { name: "Preamble Pattern", value: "7 Bytes (0x55 0x55 0x55 0x55 0x55 0x55 0x55)", desc: "Alternating square wave for PLL clock lock" },
              { name: "SFD (Start Frame Delimiter)", value: "1 Byte (0xD5 / 0b11010101)", desc: "Bit pattern ending with two consecutive '1' bits" }
            ],
            hex: "55 55 55 55 55 55 55 d5",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "Explore Layer 1 Physical Signaling ↗"
          },
          {
            key: "eth",
            layerNum: 2,
            layerName: "Layer 2: Data Link",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Ethernet II Header",
            bytes: 14,
            offset: "Frame Offset: Bytes 0–13",
            pdu: "Frame Header",
            role: "Provides local node-to-node physical MAC addressing across a shared broadcast domain. Contains 48-bit Destination MAC, 48-bit Source MAC, and 16-bit EtherType indicating the payload protocol.",
            hardware: "Layer 2 Ethernet Switches & Network Interface Cards (NICs). Switches inspect Dest MAC to forward via CAM tables.",
            fields: [
              { name: "Destination MAC", value: "00:1A:2B:3C:4D:5E", desc: "Next-hop default gateway router hardware address" },
              { name: "Source MAC", value: "3C:52:82:11:22:33", desc: "Local host sending NIC hardware address" },
              { name: "EtherType", value: "0x0800 (IPv4)", desc: "Demultiplexing tag telling receiver to pass SDU to IPv4 driver" }
            ],
            hex: "00 1a 2b 3c 4d 5e 3c 52 82 11 22 33 08 00",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet II in Header Lab ↗"
          },
          {
            key: "ip",
            layerNum: 3,
            layerName: "Layer 3: Network",
            badgeClass: "badge-l3",
            colorKey: "sky",
            name: "IPv4 Datagram Header",
            bytes: 20,
            offset: "Frame Offset: Bytes 14–33",
            pdu: "Packet Header",
            role: "Provides end-to-end logical addressing and routing across autonomous systems. Decrements TTL to stop routing loops and specifies the L4 protocol number.",
            hardware: "Layer 3 Routers & Multilayer Switches. Routers inspect Dest IP, decrement TTL, and forward across interfaces.",
            fields: [
              { name: "Version & IHL", value: "0x45 (IPv4, 20 bytes)", desc: "4-bit version=4, 4-bit header length=5 (5 x 32-bit words)" },
              { name: "DSCP / ECN", value: "0x00 (Standard Best-Effort)", desc: "Quality of Service & explicit congestion notification" },
              { name: "Total Length", value: "Calculated dynamically", desc: "Combined length of IP header + TCP + TLS payload" },
              { name: "Identification & Flags", value: "0x4A21, DF=1 (Don't Fragment)", desc: "PMTUD enabled; prevent in-flight router fragmentation" },
              { name: "TTL (Time to Live)", value: "64", desc: "Hop limit decremented by each router; drops packet at 0" },
              { name: "Protocol", value: "0x06 (TCP)", desc: "Demultiplexing tag directing packet to L4 TCP engine" },
              { name: "Header Checksum", value: "0x82C4", desc: "16-bit 1's complement protecting IP header only" },
              { name: "Source IP", value: "192.168.1.105", desc: "RFC 1918 Private host IP (NAT'd at border)" },
              { name: "Destination IP", value: "93.184.216.34", desc: "Public destination web server IP address" }
            ],
            hex: "45 00 00 5e 4a 21 40 00 40 06 82 c4 c0 a8 01 69 5d b8 d8 22",
            jumpTarget: "view-tools",
            jumpLabel: "Calculate Subnets & Masks in Tools ↗"
          },
          {
            key: "tcp",
            layerNum: 4,
            layerName: "Layer 4: Transport",
            badgeClass: "badge-l4",
            colorKey: "amber",
            name: "TCP Segment Header",
            bytes: 20,
            offset: "Frame Offset: Bytes 34–53",
            pdu: "Segment Header",
            role: "Provides end-to-end reliable, in-order byte stream delivery. Manages connection state, sequence numbers, flow control sliding windows, and cumulative acknowledgments.",
            hardware: "End-host operating system kernel TCP/IP network stack & stateful firewalls.",
            fields: [
              { name: "Source Port", value: "52144 (Ephemeral)", desc: "Outbound client socket port allocated by OS" },
              { name: "Destination Port", value: "443 (HTTPS)", desc: "Standard IANA well-known web service port" },
              { name: "Sequence Number", value: "1001 (Relative: 1)", desc: "Byte-stream offset of the first data octet" },
              { name: "Acknowledgment Number", value: "5001 (Relative: 1)", desc: "Next expected byte from the remote server" },
              { name: "Data Offset & Reserved", value: "0x50 (5 words = 20B)", desc: "Header length without optional TCP options" },
              { name: "Control Flags", value: "[ACK, PSH] (0x018)", desc: "PSH informs receiver to push data directly to app" },
              { name: "Window Size", value: "65,535 Bytes", desc: "Flow control receive buffer advertised to peer" },
              { name: "Checksum", value: "0x3A9F", desc: "Mandatory pseudo-header + TCP header + payload checksum" }
            ],
            hex: "cb e0 01 bb 00 00 03 e9 00 00 13 89 50 18 ff ff 3a 9f 00 00",
            jumpTarget: "view-handshake",
            jumpLabel: "Open Interactive TCP Handshake Simulator ↗"
          },
          {
            key: "tls",
            layerNum: "5–6",
            layerName: "Layers 5 & 6: Session & Presentation",
            badgeClass: "badge-l6",
            colorKey: "teal",
            name: "TLS 1.3 Record Layer Header",
            bytes: 5,
            offset: "Frame Offset: Bytes 54–58",
            pdu: "Record Framing",
            role: "Presentation Layer standardizes transfer syntax and provides authenticated encryption (AEAD). Session Layer manages cryptographic session tickets, keys, and connection resumption.",
            hardware: "OpenSSL / BoringSSL cryptographic libraries within user space or TLS hardware offload acceleration engines.",
            fields: [
              { name: "Content Type", value: "0x17 (Application Data)", desc: "Opaque encrypted ciphertext payload" },
              { name: "Legacy Version", value: "0x0303 (TLS 1.2 compatibility)", desc: "Middlebox compatibility version freeze per RFC 8446" },
              { name: "Encrypted Length", value: "N + 16 Bytes AEAD Tag", desc: "Payload length plus 16-byte Poly1305 / GCM auth tag" }
            ],
            hex: "17 03 03 00 2b",
            jumpTarget: "view-headers",
            jumpProto: "tls",
            jumpLabel: "Inspect TLS 1.3 Record in Header Lab ↗"
          },
          {
            key: "payload",
            layerNum: 7,
            layerName: "Layer 7: Application",
            badgeClass: "badge-l7",
            colorKey: "indigo",
            name: "Application SDU (HTTP Payload)",
            bytes: 35,
            offset: "Frame Offset: Bytes 59–93",
            pdu: "Data / Message (SDU)",
            role: "The original user payload delivered to the socket. In HTTPS, this plaintext is AEAD-encrypted before transmission and restored at the destination application.",
            hardware: "Web browsers (Chrome, Firefox), Nginx, Apache, curl client binaries.",
            fields: [
              { name: "HTTP Method", value: "GET /index.html HTTP/1.1", desc: "Request URI and HTTP protocol dialect" },
              { name: "Host Header", value: "Host: example.edu", desc: "Mandatory HTTP/1.1 virtual hosting header" },
              { name: "Encoding", value: "ASCII / UTF-8 Plaintext", desc: "Original application presentation encoding" }
            ],
            hex: "47 45 54 20 2f 69 6e 64 65 78 2e 68 74 6d 6c 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 65 78 61",
            jumpTarget: "view-encapsulation",
            jumpLabel: "Step Through Encapsulation Pipeline ↗"
          },
          {
            key: "fcs",
            layerNum: "2-Trailer",
            layerName: "Layer 2: Data Link (Trailer)",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Frame Check Sequence (FCS CRC-32)",
            bytes: 4,
            offset: "Frame Offset: Bytes 94–97 (Frame Trailer)",
            pdu: "Frame Trailer",
            role: "★ The ONLY layer with a trailer in the standard stack. Hardware NIC transceivers calculate a 32-bit Cyclic Redundancy Check polynomial on-the-fly as bits stream across the wire. If any bit flipped in transit, the calculated CRC mismatches and the NIC discards the corrupt frame in silicon.",
            hardware: "Ethernet MAC hardware controller. Calculated and appended by transmitter NIC; verified and stripped by receiver NIC.",
            fields: [
              { name: "Polynomial", value: "IEEE 802.3 CRC-32 (0xEDB88320)", desc: "Standard 32-bit generating polynomial" },
              { name: "Trailer Checksum", value: "0x8A2C310F", desc: "Deterministic hash of Destination MAC through Payload" },
              { name: "Error Action", value: "Silent Discard", desc: "Corrupt frames never reach kernel or L3/L4 stacks" }
            ],
            hex: "8a 2c 31 0f",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Review FCS CRC-32 in Trailer Lab ↗"
          },
          {
            key: "ipg",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Interpacket Gap (IPG)",
            bytes: 12,
            offset: "Wire Offset: Post-Frame Silence",
            pdu: "Physical Carrier Silence",
            role: "A mandatory 96-bit idle period (0.096 µs at 1 Gbps) between consecutive frames allowing receiver hardware electronics to recover, reset receiver buffers, and prepare for the next incoming preamble.",
            hardware: "Ethernet Physical Layer Transceiver (PHY).",
            fields: [
              { name: "Duration", value: "96 Bit-Times (12 octets equivalent)", desc: "Standard minimum spacing on half/full-duplex Ethernet" },
              { name: "Signal State", value: "Idle Carrier Line State", desc: "No data symbols transmitted" }
            ],
            hex: "00 00 00 00 00 00 00 00 00 00 00 00",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "Review Layer 1 Hardware Specifications ↗"
          }
        ]
      },

      dns: {
        id: "dns",
        title: "DNS Name Query (UDP + IPv4)",
        category: "Core Services",
        summary: "Lightweight connectionless query: a single UDP datagram resolving 'example.edu' to an IPv4 A-record via recursive DNS server at 1.1.1.1:53.",
        l3: "IPv4",
        l4: "UDP",
        payloadStr: "Standard query 0x1a2b A example.edu",
        segments: [
          {
            key: "preamble",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Preamble & SFD",
            bytes: 8,
            offset: "Wire Offset: -8 to -1",
            pdu: "Bits",
            role: "Physical layer clock synchronization.",
            hardware: "Transceiver PHY.",
            fields: [{ name: "Preamble & SFD", value: "8 Bytes (0x55...55D5)", desc: "Clock lock signal" }],
            hex: "55 55 55 55 55 55 55 d5",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          },
          {
            key: "eth",
            layerNum: 2,
            layerName: "Layer 2: Data Link",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Ethernet II Header",
            bytes: 14,
            offset: "Bytes 0–13",
            pdu: "Frame Header",
            role: "Local network frame transport with EtherType 0x0800 (IPv4).",
            hardware: "Layer 2 Switches & Gateway NIC.",
            fields: [
              { name: "Destination MAC", value: "00:1A:2B:3C:4D:5E", desc: "Gateway Router MAC" },
              { name: "Source MAC", value: "3C:52:82:11:22:33", desc: "Host NIC MAC" },
              { name: "EtherType", value: "0x0800 (IPv4)", desc: "Network layer payload" }
            ],
            hex: "00 1a 2b 3c 4d 5e 3c 52 82 11 22 33 08 00",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet Header ↗"
          },
          {
            key: "ip",
            layerNum: 3,
            layerName: "Layer 3: Network",
            badgeClass: "badge-l3",
            colorKey: "sky",
            name: "IPv4 Datagram Header",
            bytes: 20,
            offset: "Bytes 14–33",
            pdu: "Packet Header",
            role: "Routes packet to 1.1.1.1 DNS server with Protocol 0x11 (UDP).",
            hardware: "Routers & Gateways.",
            fields: [
              { name: "Protocol", value: "0x11 (UDP)", desc: "Directs packet to UDP engine" },
              { name: "Source IP", value: "192.168.1.105", desc: "Client IP" },
              { name: "Destination IP", value: "1.1.1.1", desc: "Cloudflare Public DNS Resolver" }
            ],
            hex: "45 00 00 3c 1a 02 40 00 40 11 9c 40 c0 a8 01 69 01 01 01 01",
            jumpTarget: "view-headers",
            jumpProto: "ipv4",
            jumpLabel: "Inspect IPv4 Header ↗"
          },
          {
            key: "udp",
            layerNum: 4,
            layerName: "Layer 4: Transport",
            badgeClass: "badge-l4",
            colorKey: "amber",
            name: "UDP Datagram Header",
            bytes: 8,
            offset: "Bytes 34–41",
            pdu: "Datagram Header",
            role: "Lightweight 8-byte connectionless header. Fire-and-forget transport with zero 3-way handshake overhead.",
            hardware: "End-host kernel UDP stack.",
            fields: [
              { name: "Source Port", value: "58912", desc: "Ephemeral client query port" },
              { name: "Destination Port", value: "53 (DNS)", desc: "Well-known DNS service port" },
              { name: "Length", value: "37 Bytes", desc: "8B UDP header + 29B DNS query payload" },
              { name: "Checksum", value: "0x4F12", desc: "Optional IPv4 checksum" }
            ],
            hex: "e6 20 00 35 00 25 4f 12",
            jumpTarget: "view-headers",
            jumpProto: "udp",
            jumpLabel: "Inspect UDP Datagram in Lab ↗"
          },
          {
            key: "payload",
            layerNum: 7,
            layerName: "Layer 7: Application",
            badgeClass: "badge-l7",
            colorKey: "indigo",
            name: "DNS Query Message (RFC 1035)",
            bytes: 29,
            offset: "Bytes 42–70",
            pdu: "Application SDU",
            role: "Standard recursive DNS query asking for A-record for 'example.edu'.",
            hardware: "Recursive DNS Resolver & Host Stub Resolver.",
            fields: [
              { name: "Transaction ID", value: "0x1A2B", desc: "Matches response with query" },
              { name: "Flags", value: "0x0100 (Standard query, RD=1)", desc: "Recursion Desired set" },
              { name: "Questions", value: "1 (example.edu: Type A, Class IN)", desc: "Query target domain" }
            ],
            hex: "1a 2b 01 00 00 01 00 00 00 00 00 00 07 65 78 61 6d 70 6c 65 03 65 64 75 00 00 01 00 01",
            jumpTarget: "view-terminal",
            jumpLabel: "Run 'dig' / 'nslookup' in Terminal ↗"
          },
          {
            key: "fcs",
            layerNum: "2-Trailer",
            layerName: "Layer 2: Data Link (Trailer)",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "FCS CRC-32 Trailer",
            bytes: 4,
            offset: "Bytes 71–74",
            pdu: "Frame Check Sequence",
            role: "Hardware error-detecting CRC-32 trailer protecting entire Ethernet payload.",
            hardware: "NIC Hardware MAC Controller.",
            fields: [{ name: "CRC-32", value: "0x5E81A0B2", desc: "Hardware checksum" }],
            hex: "5e 81 a0 b2",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet FCS Trailer ↗"
          },
          {
            key: "ipg",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Interpacket Gap",
            bytes: 12,
            offset: "Post-Frame Wire Silence",
            pdu: "Carrier Gap",
            role: "96-bit interframe pause.",
            hardware: "PHY Transceiver.",
            fields: [{ name: "Gap", value: "96 Bits (12 Bytes)", desc: "PHY recovery time" }],
            hex: "00 00 00 00 00 00 00 00 00 00 00 00",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          }
        ]
      },

      http3: {
        id: "http3",
        title: "HTTP/3 over QUIC & IPv6",
        category: "Modern Web",
        summary: "Next-generation web transport: HTTP/3 multiplexing over QUIC (UDP) on 128-bit IPv6 addressing. Features zero head-of-line blocking and integrated TLS 1.3 encryption.",
        l3: "IPv6",
        l4: "UDP",
        payloadStr: "QUIC 1-RTT Stream Data (HTTP/3 Frame)",
        segments: [
          {
            key: "preamble",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Preamble & SFD",
            bytes: 8,
            offset: "Wire Offset: -8 to -1",
            pdu: "Bits",
            role: "Physical layer clock synchronization.",
            hardware: "Transceiver PHY.",
            fields: [{ name: "Preamble", value: "8 Bytes (0x55...D5)", desc: "Clock lock" }],
            hex: "55 55 55 55 55 55 55 d5",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          },
          {
            key: "eth",
            layerNum: 2,
            layerName: "Layer 2: Data Link",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Ethernet II Header (IPv6 EtherType)",
            bytes: 14,
            offset: "Bytes 0–13",
            pdu: "Frame Header",
            role: "Data Link framing with EtherType 0x86DD designating an IPv6 payload.",
            hardware: "Layer 2 Switches.",
            fields: [
              { name: "Destination MAC", value: "00:1A:2B:3C:4D:5E", desc: "Default Gateway router" },
              { name: "Source MAC", value: "3C:52:82:11:22:33", desc: "Client NIC" },
              { name: "EtherType", value: "0x86DD (IPv6)", desc: "Designates 128-bit IPv6 payload" }
            ],
            hex: "00 1a 2b 3c 4d 5e 3c 52 82 11 22 33 86 dd",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet Header ↗"
          },
          {
            key: "ip",
            layerNum: 3,
            layerName: "Layer 3: Network",
            badgeClass: "badge-l3",
            colorKey: "sky",
            name: "IPv6 Fixed Header (RFC 8200)",
            bytes: 40,
            offset: "Bytes 14–53",
            pdu: "Packet Header",
            role: "Fixed 40-byte IPv6 header. No router checksumming (delegated to L4) and 128-bit global addresses.",
            hardware: "IPv6 Routers. Routers decrement Hop Limit.",
            fields: [
              { name: "Version", value: "6", desc: "4-bit IP version" },
              { name: "Traffic Class & Flow Label", value: "0x00, 0x12345", desc: "Per-flow QoS routing tag" },
              { name: "Payload Length", value: "48 Bytes", desc: "Length of data following this 40B header" },
              { name: "Next Header", value: "17 (UDP)", desc: "Replaces IPv4 Protocol field" },
              { name: "Hop Limit", value: "64", desc: "Replaces IPv4 TTL" },
              { name: "Source IPv6", value: "2001:db8:85a3::8a2e:370:7334", desc: "128-bit global unicast source address" },
              { name: "Destination IPv6", value: "2606:2800:220:1:248:1893:25c8:1946", desc: "128-bit destination server address" }
            ],
            hex: "60 01 23 45 00 30 11 40 20 01 0d b8 85 a3 00 00 00 00 8a 2e 03 70 73 34 26 06 28 00 02 20 00 01 02 48 18 93 25 c8 19 46",
            jumpTarget: "view-headers",
            jumpProto: "ipv6",
            jumpLabel: "Inspect IPv6 Header & EUI-64 ↗"
          },
          {
            key: "udp",
            layerNum: 4,
            layerName: "Layer 4: Transport",
            badgeClass: "badge-l4",
            colorKey: "amber",
            name: "UDP Datagram (QUIC Transport Carrier)",
            bytes: 8,
            offset: "Bytes 54–61",
            pdu: "Datagram Header",
            role: "QUIC uses UDP as an encapsulation layer to traverse existing middleboxes and firewalls without kernel OS updates.",
            hardware: "End-host QUIC implementation (Chromium, Cloudflare quiche).",
            fields: [
              { name: "Source Port", value: "54200", desc: "Client UDP port" },
              { name: "Destination Port", value: "443 (HTTP/3)", desc: "Web server QUIC port" },
              { name: "Length", value: "48 Bytes", desc: "8B UDP + 40B QUIC payload" }
            ],
            hex: "d3 b8 01 bb 00 30 c1 24",
            jumpTarget: "view-headers",
            jumpProto: "udp",
            jumpLabel: "Inspect UDP Header ↗"
          },
          {
            key: "payload",
            layerNum: "5–7",
            layerName: "Layers 5–7: QUIC & HTTP/3",
            badgeClass: "badge-l7",
            colorKey: "indigo",
            name: "QUIC 1-RTT Packet & HTTP/3 Payload",
            bytes: 40,
            offset: "Bytes 62–101",
            pdu: "Encrypted Stream Frame",
            role: "Integrated TLS 1.3 encryption with multiplexed HTTP/3 stream framing. Loss on one stream never delays other streams.",
            hardware: "Web Server & Client Browser Engine.",
            fields: [
              { name: "QUIC Header Form", value: "Short Header (1-RTT Data)", desc: "Post-handshake connection data packet" },
              { name: "Packet Number", value: "42 (Encrypted)", desc: "Monotonically increasing sequence space" },
              { name: "HTTP/3 Frame", value: "HEADERS (Stream ID 0)", desc: "QPACK compressed web request headers" }
            ],
            hex: "43 1f 00 2a 01 00 00 00 05 04 00 00 00 00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 19 20",
            jumpTarget: "view-encapsulation",
            jumpLabel: "Explore Encapsulation Lab ↗"
          },
          {
            key: "fcs",
            layerNum: "2-Trailer",
            layerName: "Layer 2: Data Link (Trailer)",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "FCS CRC-32 Trailer",
            bytes: 4,
            offset: "Bytes 102–105",
            pdu: "Frame Trailer",
            role: "Hardware CRC-32 checksum.",
            hardware: "NIC Hardware MAC Controller.",
            fields: [{ name: "CRC-32", value: "0x7F21CB90", desc: "Hardware checksum" }],
            hex: "7f 21 cb 90",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet FCS Trailer ↗"
          },
          {
            key: "ipg",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Interpacket Gap",
            bytes: 12,
            offset: "Post-Frame Wire Silence",
            pdu: "Carrier Gap",
            role: "96-bit interframe pause.",
            hardware: "PHY Transceiver.",
            fields: [{ name: "Gap", value: "96 Bits (12 Bytes)", desc: "PHY recovery time" }],
            hex: "00 00 00 00 00 00 00 00 00 00 00 00",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          }
        ]
      },

      icmp: {
        id: "icmp",
        title: "ICMP Echo Request (Ping on IPv4)",
        category: "Diagnostics",
        summary: "The quintessential network diagnostic packet: an ICMP Type 8 Echo Request testing end-to-end IP reachability and measuring round-trip latency.",
        l3: "IPv4",
        l4: "ICMP",
        payloadStr: "abcdefghijklmnopqrstuvwabcdefghi (32-byte echo payload)",
        segments: [
          {
            key: "preamble",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Preamble & SFD",
            bytes: 8,
            offset: "Wire Offset: -8 to -1",
            pdu: "Bits",
            role: "Physical clock synchronization.",
            hardware: "Transceiver PHY.",
            fields: [{ name: "Preamble", value: "8 Bytes (0x55...D5)", desc: "Clock lock" }],
            hex: "55 55 55 55 55 55 55 d5",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          },
          {
            key: "eth",
            layerNum: 2,
            layerName: "Layer 2: Data Link",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Ethernet II Header",
            bytes: 14,
            offset: "Bytes 0–13",
            pdu: "Frame Header",
            role: "Data Link framing with EtherType 0x0800 (IPv4).",
            hardware: "Layer 2 Switches.",
            fields: [
              { name: "Destination MAC", value: "00:1A:2B:3C:4D:5E", desc: "Default Gateway MAC" },
              { name: "Source MAC", value: "3C:52:82:11:22:33", desc: "Client NIC MAC" },
              { name: "EtherType", value: "0x0800 (IPv4)", desc: "IPv4 payload" }
            ],
            hex: "00 1a 2b 3c 4d 5e 3c 52 82 11 22 33 08 00",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet Header ↗"
          },
          {
            key: "ip",
            layerNum: 3,
            layerName: "Layer 3: Network",
            badgeClass: "badge-l3",
            colorKey: "sky",
            name: "IPv4 Datagram Header",
            bytes: 20,
            offset: "Bytes 14–33",
            pdu: "Packet Header",
            role: "IPv4 network layer with Protocol 0x01 designating ICMP.",
            hardware: "Routers & Destination Host.",
            fields: [
              { name: "Protocol", value: "0x01 (ICMP)", desc: "Directs packet to kernel ICMP handler" },
              { name: "Source IP", value: "192.168.1.105", desc: "Pinging Host" },
              { name: "Destination IP", value: "8.8.8.8", desc: "Google Public DNS (Echo Target)" }
            ],
            hex: "45 00 00 3c 5c 31 00 00 40 01 81 20 c0 a8 01 69 08 08 08 08",
            jumpTarget: "view-headers",
            jumpProto: "ipv4",
            jumpLabel: "Inspect IPv4 Header ↗"
          },
          {
            key: "icmp",
            layerNum: "3–4",
            layerName: "Layer 3/4: Network Diagnostic",
            badgeClass: "badge-l3",
            colorKey: "sky",
            name: "ICMP Echo Request Header",
            bytes: 8,
            offset: "Bytes 34–41",
            pdu: "ICMP Control Message",
            role: "ICMP runs directly over IP without TCP/UDP transport. Type 8 requests an immediate ICMP Type 0 Echo Reply.",
            hardware: "Operating System Kernel Network Stack.",
            fields: [
              { name: "Type", value: "8 (Echo Request)", desc: "Ping request signal" },
              { name: "Code", value: "0", desc: "Sub-code (0 for Echo)" },
              { name: "Checksum", value: "0x4D5A", desc: "16-bit 1's complement ICMP checksum" },
              { name: "Identifier", value: "0x0001", desc: "Process PID to match reply with ping instance" },
              { name: "Sequence Number", value: "1", desc: "Packet sequence index for RTT calculation" }
            ],
            hex: "08 00 4d 5a 00 01 00 01",
            jumpTarget: "view-terminal",
            jumpLabel: "Run 'ping' in Diagnostic Terminal ↗"
          },
          {
            key: "payload",
            layerNum: 7,
            layerName: "Layer 7: Diagnostic Data",
            badgeClass: "badge-l7",
            colorKey: "indigo",
            name: "Echo Timestamp & Diagnostic Payload",
            bytes: 32,
            offset: "Bytes 42–73",
            pdu: "Echo Data",
            role: "Contains transmission timestamp (to compute exact RTT latency) followed by standard alphabetic filler pattern.",
            hardware: "OS Ping utility.",
            fields: [
              { name: "Timestamp", value: "8 Bytes Monotonic Clock", desc: "High-resolution transmission time" },
              { name: "Pattern", value: "24 Bytes (abcdefghijklmnopqrstuvw...)", desc: "Payload padding" }
            ],
            hex: "61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 61 62 63 64 65 66 67 68 69",
            jumpTarget: "view-terminal",
            jumpLabel: "Open CLI Terminal Lab ↗"
          },
          {
            key: "fcs",
            layerNum: "2-Trailer",
            layerName: "Layer 2: Data Link (Trailer)",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "FCS CRC-32 Trailer",
            bytes: 4,
            offset: "Bytes 74–77",
            pdu: "Frame Trailer",
            role: "Hardware CRC-32 checksum.",
            hardware: "NIC Hardware MAC Controller.",
            fields: [{ name: "CRC-32", value: "0x913B0182", desc: "Hardware checksum" }],
            hex: "91 3b 01 82",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet FCS Trailer ↗"
          },
          {
            key: "ipg",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Interpacket Gap",
            bytes: 12,
            offset: "Post-Frame Wire Silence",
            pdu: "Carrier Gap",
            role: "96-bit interframe pause.",
            hardware: "PHY Transceiver.",
            fields: [{ name: "Gap", value: "96 Bits (12 Bytes)", desc: "PHY recovery time" }],
            hex: "00 00 00 00 00 00 00 00 00 00 00 00",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          }
        ]
      },

      arp: {
        id: "arp",
        title: "ARP Request & Minimum Frame Padding (Layer 2)",
        category: "Address Resolution",
        summary: "★ High-value pedagogical concept: An Address Resolution Protocol (ARP) query broadcast across Layer 2. Because the ARP packet is only 28 bytes (total frame 42 bytes), Ethernet enforces an 18-byte PADDING block to satisfy the mandatory 64-byte minimum frame size!",
        l3: "ARP",
        l4: "None",
        payloadStr: "Who has 192.168.1.1? Tell 192.168.1.105",
        segments: [
          {
            key: "preamble",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Preamble & SFD",
            bytes: 8,
            offset: "Wire Offset: -8 to -1",
            pdu: "Bits",
            role: "Physical clock synchronization.",
            hardware: "Transceiver PHY.",
            fields: [{ name: "Preamble", value: "8 Bytes (0x55...D5)", desc: "Clock lock" }],
            hex: "55 55 55 55 55 55 55 d5",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          },
          {
            key: "eth",
            layerNum: 2,
            layerName: "Layer 2: Data Link",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Ethernet II Header (Broadcast)",
            bytes: 14,
            offset: "Bytes 0–13",
            pdu: "Frame Header",
            role: "Broadcast destination MAC (FF:FF:FF:FF:FF:FF) floods all switch ports. EtherType 0x0806 designates ARP.",
            hardware: "Layer 2 Switches flood this broadcast frame to all active ports.",
            fields: [
              { name: "Destination MAC", value: "FF:FF:FF:FF:FF:FF (Broadcast)", desc: "All local hosts inspect this frame" },
              { name: "Source MAC", value: "3C:52:82:11:22:33", desc: "Querier NIC hardware address" },
              { name: "EtherType", value: "0x0806 (ARP)", desc: "Address Resolution Protocol" }
            ],
            hex: "ff ff ff ff ff ff 3c 52 82 11 22 33 08 06",
            jumpTarget: "view-headers",
            jumpProto: "arp",
            jumpLabel: "Inspect ARP in Header Lab ↗"
          },
          {
            key: "arp",
            layerNum: "2–3",
            layerName: "Layer 2/3: Address Resolution",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "ARP Request Packet (RFC 826)",
            bytes: 28,
            offset: "Bytes 14–41",
            pdu: "ARP Message",
            role: "Translates logical IPv4 address into hardware MAC address. Asks: 'Who has 192.168.1.1? Tell 192.168.1.105'.",
            hardware: "Operating System ARP Table / Neighbor Cache.",
            fields: [
              { name: "Hardware Type", value: "1 (Ethernet 10Mb/100Mb/1Gb)", desc: "Hardware architecture" },
              { name: "Protocol Type", value: "0x0800 (IPv4)", desc: "Logical protocol mapped" },
              { name: "Hardware / Protocol Size", value: "6, 4", desc: "MAC=6B, IPv4=4B" },
              { name: "Opcode", value: "1 (ARP Request)", desc: "1=Request, 2=Reply" },
              { name: "Sender MAC / IP", value: "3C:52:82:11:22:33 / 192.168.1.105", desc: "Local requester credentials" },
              { name: "Target MAC / IP", value: "00:00:00:00:00:00 / 192.168.1.1", desc: "Target unknown MAC and known target IP" }
            ],
            hex: "00 01 08 00 06 04 00 01 3c 52 82 11 22 33 c0 a8 01 69 00 00 00 00 00 00 c0 a8 01 01",
            jumpTarget: "view-terminal",
            jumpLabel: "Inspect 'arp -a' in Terminal ↗"
          },
          {
            key: "padding",
            layerNum: 2,
            layerName: "Layer 2: Padding (CSMA/CD Constraint)",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "Ethernet Minimum Frame Padding",
            bytes: 18,
            offset: "Bytes 42–59",
            pdu: "Hardware Padding",
            role: "★ Critical CSCI 250 examination concept: Ethernet CSMA/CD collision detection requires a minimum slot time of 512 bit-times (64 bytes). Because Ethernet Header (14B) + ARP (28B) + FCS (4B) = 46B, the transmitter NIC MUST append 18 bytes of zero padding to satisfy the 64-byte minimum frame constraint!",
            hardware: "Transmitting NIC Hardware MAC Controller.",
            fields: [
              { name: "Padding Size", value: "18 Bytes", desc: "Brings frame size from 46B up to 64B" },
              { name: "Padding Pattern", value: "All zeros (0x00 x 18)", desc: "Null bytes discarded by receiver" },
              { name: "Rule", value: "IEEE 802.3 Minimum Frame Rule", desc: "Prevents collision window expiration before detect" }
            ],
            hex: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
            jumpTarget: "view-quiz",
            jumpLabel: "Practice Minimum Frame Questions in Quiz ↗"
          },
          {
            key: "fcs",
            layerNum: "2-Trailer",
            layerName: "Layer 2: Data Link (Trailer)",
            badgeClass: "badge-l2",
            colorKey: "emerald",
            name: "FCS CRC-32 Trailer",
            bytes: 4,
            offset: "Bytes 60–63 (Total Frame: 64B)",
            pdu: "Frame Trailer",
            role: "Hardware CRC-32 checksum.",
            hardware: "NIC Hardware MAC Controller.",
            fields: [{ name: "CRC-32", value: "0xD4A12B09", desc: "Hardware checksum" }],
            hex: "d4 a1 2b 09",
            jumpTarget: "view-headers",
            jumpProto: "ethernet",
            jumpLabel: "Inspect Ethernet FCS Trailer ↗"
          },
          {
            key: "ipg",
            layerNum: 1,
            layerName: "Layer 1: Physical",
            badgeClass: "badge-l1",
            colorKey: "purple",
            name: "Interpacket Gap",
            bytes: 12,
            offset: "Post-Frame Wire Silence",
            pdu: "Carrier Gap",
            role: "96-bit interframe pause.",
            hardware: "PHY Transceiver.",
            fields: [{ name: "Gap", value: "96 Bits (12 Bytes)", desc: "PHY recovery time" }],
            hex: "00 00 00 00 00 00 00 00 00 00 00 00",
            jumpTarget: "view-layers",
            jumpLayer: 1,
            jumpLabel: "View Physical Layer ↗"
          }
        ]
      }
    };
  }

  init() {
    this.bindEvents();
    this.renderScenario(this.currentScenario);
  }

  escapeHtml(str) {
    if (typeof str !== "string") return String(str);
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  bindEvents() {
    // Scenario Preset Buttons
    const presetBtns = document.querySelectorAll(".frame-scenario-btn");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const scenarioId = btn.dataset.scenario;
        if (scenarioId) {
          presetBtns.forEach(b => {
            b.classList.remove("active", "border-indigo-500", "bg-indigo-950/60", "text-white");
            b.classList.add("border-slate-800", "bg-slate-900/60", "text-slate-400");
          });
          btn.classList.add("active", "border-indigo-500", "bg-indigo-950/60", "text-white");
          btn.classList.remove("border-slate-800", "bg-slate-900/60", "text-slate-400");
          this.renderScenario(scenarioId);
        }
      });
    });
  }

  renderScenario(scenarioId) {
    this.currentScenario = scenarioId;
    const scen = this.scenarios[scenarioId];
    if (!scen) return;

    // Calculate metrics
    let totalWireBytes = 0;
    let ethernetFrameBytes = 0;
    let payloadBytes = 0;
    let headerOverheadBytes = 0;

    scen.segments.forEach(seg => {
      totalWireBytes += seg.bytes;
      if (seg.key !== "preamble" && seg.key !== "ipg") {
        ethernetFrameBytes += seg.bytes;
        if (seg.key === "payload") {
          payloadBytes += seg.bytes;
        } else {
          headerOverheadBytes += seg.bytes;
        }
      }
    });

    const payloadEfficiency = ethernetFrameBytes > 0 
      ? ((payloadBytes / ethernetFrameBytes) * 100).toFixed(1) 
      : 0;
    const mtuPercent = ((ethernetFrameBytes / 1500) * 100).toFixed(1);

    // Update Metrics in DOM
    const wireBytesEl = document.getElementById("frame-metric-wire");
    const frameBytesEl = document.getElementById("frame-metric-frame");
    const effEl = document.getElementById("frame-metric-efficiency");
    const mtuEl = document.getElementById("frame-metric-mtu");
    const ruleEl = document.getElementById("frame-metric-rule");

    if (wireBytesEl) wireBytesEl.textContent = `${totalWireBytes} Bytes`;
    if (frameBytesEl) frameBytesEl.textContent = `${ethernetFrameBytes} Bytes`;
    if (effEl) effEl.textContent = `${payloadEfficiency}%`;
    if (mtuEl) mtuEl.textContent = `${ethernetFrameBytes} / 1500 B (${mtuPercent}%)`;
    if (ruleEl) {
      if (ethernetFrameBytes >= 64) {
        ruleEl.innerHTML = `<span class="text-emerald-400 font-semibold">✔ Compliant</span> (≥64B min)`;
      } else {
        ruleEl.innerHTML = `<span class="text-amber-400 font-semibold">⚠ Padded</span> (${64 - ethernetFrameBytes}B needed)`;
      }
    }

    // Render Scenario Title & Description
    const titleEl = document.getElementById("frame-scenario-title");
    const descEl = document.getElementById("frame-scenario-desc");
    if (titleEl) titleEl.textContent = scen.title;
    if (descEl) descEl.textContent = scen.summary;

    // Render the Proportional Frame Buffer Bar
    this.renderBufferStrip(scen, ethernetFrameBytes);

    // Default select segment (e.g. 'tcp' or first available)
    const defaultSeg = scen.segments.find(s => s.key === "tcp") 
      || scen.segments.find(s => s.key === "eth") 
      || scen.segments[1] 
      || scen.segments[0];
    if (defaultSeg) {
      this.renderSegmentDetail(defaultSeg.key);
    }
  }

  renderBufferStrip(scen, totalEthBytes) {
    const stripContainer = document.getElementById("frame-wire-strip");
    if (!stripContainer) return;

    stripContainer.innerHTML = "";

    scen.segments.forEach(seg => {
      const segBtn = document.createElement("button");
      segBtn.className = `frame-segment-block flex-1 min-w-[90px] p-3 text-left transition-all duration-200 border rounded-xl relative overflow-hidden group ${this.getSegmentColorClasses(seg.colorKey, seg.key === this.selectedSegment)}`;
      segBtn.dataset.key = seg.key;

      // Proportional or flex layout
      segBtn.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-700/50">
            ${this.escapeHtml(seg.layerName.split(":")[0])}
          </span>
          <span class="text-[11px] font-mono font-semibold text-slate-300">
            ${seg.bytes}B
          </span>
        </div>
        <div class="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
          ${this.escapeHtml(seg.name)}
        </div>
        <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
          ${this.escapeHtml(seg.offset)}
        </div>
      `;

      segBtn.addEventListener("click", () => {
        this.renderSegmentDetail(seg.key);
      });

      stripContainer.appendChild(segBtn);
    });
  }

  getSegmentColorClasses(colorKey, isActive) {
    const activeRing = isActive ? "ring-2 ring-indigo-400 scale-[1.02] shadow-2xl z-10 brightness-110" : "hover:border-slate-500 hover:brightness-105";
    switch (colorKey) {
      case "purple": // L1
        return `bg-purple-950/40 border-purple-500/30 text-purple-200 ${activeRing}`;
      case "emerald": // L2 & FCS
        return `bg-emerald-950/40 border-emerald-500/30 text-emerald-200 ${activeRing}`;
      case "sky": // L3
        return `bg-sky-950/40 border-sky-500/30 text-sky-200 ${activeRing}`;
      case "amber": // L4
        return `bg-amber-950/40 border-amber-500/30 text-amber-200 ${activeRing}`;
      case "teal": // L5/6
        return `bg-teal-950/40 border-teal-500/30 text-teal-200 ${activeRing}`;
      case "indigo": // L7
        return `bg-indigo-950/40 border-indigo-500/30 text-indigo-200 ${activeRing}`;
      default:
        return `bg-slate-900 border-slate-700 text-slate-200 ${activeRing}`;
    }
  }

  renderSegmentDetail(segmentKey) {
    this.selectedSegment = segmentKey;
    const scen = this.scenarios[this.currentScenario];
    if (!scen) return;

    const seg = scen.segments.find(s => s.key === segmentKey);
    if (!seg) return;

    // Update active style on all strip blocks
    const stripBlocks = document.querySelectorAll(".frame-segment-block");
    stripBlocks.forEach(b => {
      const isAct = b.dataset.key === segmentKey;
      const bSeg = scen.segments.find(s => s.key === b.dataset.key);
      if (bSeg) {
        b.className = `frame-segment-block flex-1 min-w-[90px] p-3 text-left transition-all duration-200 border rounded-xl relative overflow-hidden group ${this.getSegmentColorClasses(bSeg.colorKey, isAct)}`;
      }
    });

    const detailContainer = document.getElementById("frame-segment-detail");
    if (!detailContainer) return;

    detailContainer.innerHTML = `
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <!-- Detail Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-${seg.colorKey === 'emerald' ? 'emerald' : seg.colorKey}-500/20 text-${seg.colorKey === 'emerald' ? 'emerald' : seg.colorKey}-300 border border-${seg.colorKey === 'emerald' ? 'emerald' : seg.colorKey}-500/30">
                ${this.escapeHtml(seg.layerName)}
              </span>
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                ${seg.bytes} Bytes
              </span>
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                PDU: ${this.escapeHtml(seg.pdu)}
              </span>
            </div>
            <h3 class="text-xl font-bold text-white tracking-tight">${this.escapeHtml(seg.name)}</h3>
            <p class="text-xs text-slate-400 font-mono mt-0.5">${this.escapeHtml(seg.offset)}</p>
          </div>

          <!-- Deep-dive cross navigation jump button -->
          <div>
            <button id="frame-jump-btn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2">
              <span>${this.escapeHtml(seg.jumpLabel)}</span>
            </button>
          </div>
        </div>

        <!-- 3-Column Architectural Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <!-- Col 1: Architectural Role & Hardware Processing -->
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                Layer Responsibility & Architecture
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">${this.escapeHtml(seg.role)}</p>
            </div>

            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                Hardware & Device Scope
              </h4>
              <p class="text-xs text-slate-400 leading-relaxed">${this.escapeHtml(seg.hardware)}</p>
            </div>
          </div>

          <!-- Col 2: Field Values in this Frame -->
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-sky-400"></span>
              Bitfield Values (Active Scenario)
            </h4>
            <div class="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              ${seg.fields.map(f => `
                <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <strong class="text-white font-mono">${this.escapeHtml(f.name)}</strong>
                    <code class="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">${this.escapeHtml(f.value)}</code>
                  </div>
                  <div class="text-[11px] text-slate-400 leading-normal">${this.escapeHtml(f.desc)}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Col 3: Raw Wire Hex Representation -->
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-teal-400"></span>
                Raw Wire Octets (Hex Dump)
              </h4>
              <span class="text-[10px] font-mono text-slate-500">${seg.bytes} Octets</span>
            </div>
            <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-teal-300 leading-relaxed tracking-wider break-all flex-1 select-all overflow-y-auto max-h-[220px]">
              ${this.formatHexDump(seg.hex)}
            </div>
            <div class="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span>Byte Order: <strong>Network Byte Order (Big-Endian)</strong></span>
              <span class="font-mono text-slate-500">MSB First</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Jump Button
    const jumpBtn = document.getElementById("frame-jump-btn");
    if (jumpBtn) {
      jumpBtn.addEventListener("click", () => {
        if (seg.jumpTarget) {
          window.location.hash = seg.jumpTarget;

          // If layer specified, trigger layer pill
          if (seg.jumpLayer !== undefined) {
            setTimeout(() => {
              const pill = document.querySelector(`.layer-pill[data-layer="${seg.jumpLayer}"]`);
              if (pill) pill.click();
            }, 50);
          }

          // If proto specified, trigger proto button
          if (seg.jumpProto) {
            setTimeout(() => {
              const pBtn = document.querySelector(`.proto-btn[data-proto="${seg.jumpProto}"]`);
              if (pBtn) pBtn.click();
            }, 50);
          }
        }
      });
    }
  }

  formatHexDump(hexStr) {
    if (!hexStr) return "";
    const bytes = hexStr.split(" ");
    return bytes.map((b, idx) => {
      const isEven = Math.floor(idx / 8) % 2 === 0;
      return `<span class="inline-block px-1 py-0.5 rounded ${isEven ? 'text-teal-300 bg-teal-950/30' : 'text-sky-300 bg-sky-950/30'}">${this.escapeHtml(b)}</span>`;
    }).join(" ");
  }
}

// Global Export
window.FullFrameVisualizer = FullFrameVisualizer;
