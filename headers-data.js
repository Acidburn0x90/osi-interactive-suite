/**
 * OSI Interactive Suite - Header & Trailer Data Specifications
 * Complete bit-by-bit and byte-by-byte breakdowns for Layers 1-4.
 */

const HEADER_SPECS = {
  ethernet: {
    id: "ethernet",
    name: "Ethernet II (IEEE 802.3)",
    layer: 2,
    layerName: "Data Link Layer",
    pdu: "Frame",
    description: "The standard data link framing used across modern LANs. Encapsulates network packets with physical addressing (MAC) and provides hardware-level error checking via the Frame Check Sequence (FCS) trailer.",
    totalLengthStandard: "14 bytes header + 46-1500 bytes payload + 4 bytes trailer (Total: 64-1518 bytes)",
    trailerExplanation: {
      title: "Why does Layer 2 have a Trailer?",
      content: "The Frame Check Sequence (FCS) trailer contains a 32-bit Cyclic Redundancy Check (CRC-32). Layer 2 is the ONLY layer with a physical trailer because as network interface cards (NICs) transmit bits serially over the wire, hardware shift-registers compute the CRC polynomial on the fly across the entire frame. Appending the FCS at the tail allows the receiving NIC to verify data integrity immediately as the final bit arrives and discard corrupted frames before allocating system memory or interrupting the host CPU."
    },
    fields: [
      {
        name: "Preamble",
        bytes: 7,
        bits: "56 bits",
        hex: "0xAA AA AA AA AA AA AA",
        binary: "10101010 × 7 octets",
        offset: "Bytes -8 to -2 (Physical framing)",
        purpose: "Clock Synchronization",
        desc: "Alternating 1s and 0s that allow physical transceivers on the link to synchronize their bit-timing clocks before the payload arrives. (Often stripped before Wireshark captures).",
        role: "Physical/Link synchronization"
      },
      {
        name: "Start Frame Delimiter (SFD)",
        bytes: 1,
        bits: "8 bits",
        hex: "0xAB",
        binary: "10101011",
        offset: "Byte -1",
        purpose: "Frame Boundary Indicator",
        desc: "Signals the immediate start of the destination MAC address. The final two consecutive 1s break the alternating sync pattern to declare 'data begins now'.",
        role: "Frame boundary marking"
      },
      {
        name: "Destination MAC Address",
        bytes: 6,
        bits: "48 bits",
        hex: "e.g. 00:1A:2B:3C:4D:5E",
        binary: "48-bit hardware identifier",
        offset: "Bytes 0 to 5",
        purpose: "Hardware Recipient Address",
        desc: "Specifies the physical MAC address of the destination interface on the local segment. If set to FF:FF:FF:FF:FF:FF, it represents a broadcast frame delivered to all nodes on the link.",
        role: "Local link hop routing",
        anatomy: "First 24 bits = OUI (Manufacturer assigned by IEEE). Last 24 bits = NIC identifier assigned by vendor."
      },
      {
        name: "Source MAC Address",
        bytes: 6,
        bits: "48 bits",
        hex: "e.g. 3C:52:82:11:22:33",
        binary: "48-bit hardware identifier",
        offset: "Bytes 6 to 11",
        purpose: "Hardware Sender Address",
        desc: "Identifies the transmitting NIC. Network switches inspect this field to automatically populate their CAM (Content Addressable Memory) MAC address table for port learning.",
        role: "Sender identification & switch learning"
      },
      {
        name: "EtherType / Length",
        bytes: 2,
        bits: "16 bits",
        hex: "0x0800 (IPv4), 0x86DD (IPv6), 0x0806 (ARP)",
        binary: "16-bit type indicator",
        offset: "Bytes 12 to 13",
        purpose: "Upper Layer Demultiplexing",
        desc: "Indicates which Layer 3 protocol is encapsulated in the payload. Values >= 0x0600 represent EtherType; values <= 0x05DC represent 802.3 frame length.",
        role: "Protocol multiplexing"
      },
      {
        name: "Payload (L3 Packet / SDU)",
        bytes: "46 to 1500",
        bits: "368 to 12,000 bits",
        hex: "Variable Data",
        binary: "Encapsulated L3 PDU",
        offset: "Bytes 14 to 1513 (or MTU)",
        purpose: "Network Layer PDU",
        desc: "The Service Data Unit (SDU) passed down from Layer 3 (e.g. IPv4 or IPv6 packet). Minimum Ethernet payload is 46 bytes (padded with zeros if smaller) to satisfy the 64-byte minimum frame size required for CSMA/CD collision detection.",
        role: "Payload delivery"
      },
      {
        name: "Frame Check Sequence (FCS Trailer)",
        bytes: 4,
        bits: "32 bits",
        hex: "e.g. 0x89 ABCDEF",
        binary: "32-bit CRC Polynomial result",
        offset: "Last 4 Bytes (Trailing field)",
        purpose: "Error Detection Trailer (CRC-32)",
        desc: "Calculated using the 32-bit Cyclic Redundancy Check (CRC) polynomial across Destination MAC, Source MAC, EtherType, and Payload. If the receiving NIC computes a mismatched CRC, the entire frame is silently dropped.",
        role: "Bit-level transmission error detection",
        isTrailer: true
      }
    ]
  },

  ipv4: {
    id: "ipv4",
    name: "IPv4 (Internet Protocol v4 - RFC 791)",
    layer: 3,
    layerName: "Network Layer",
    pdu: "Packet",
    description: "The foundational logical addressing and routing protocol of the global Internet. Uses 32-bit hierarchical addresses structured into Network and Host portions.",
    totalLengthStandard: "20 bytes minimum (up to 60 bytes with options)",
    fields: [
      {
        name: "Version",
        bits: "4 bits",
        offset: "Bit 0 to 3",
        defaultValue: "0100 (4)",
        desc: "Identifies the IP protocol version. Always 4 for IPv4 (0100 in binary). Routers immediately discard datagrams if this does not match their IP stack.",
        row: 1
      },
      {
        name: "IHL (Internet Header Length)",
        bits: "4 bits",
        offset: "Bit 4 to 7",
        defaultValue: "0101 (5 words = 20 bytes)",
        desc: "Length of the IP header in 32-bit (4-byte) words. Minimum value is 5 (5 × 4 = 20 bytes). Maximum is 15 (60 bytes when options are present).",
        row: 1
      },
      {
        name: "DSCP (Differentiated Services)",
        bits: "6 bits",
        offset: "Bit 8 to 13",
        defaultValue: "000000 (Default)",
        desc: "Used for Quality of Service (QoS). Classifies real-time traffic like VoIP (e.g. EF - Expedited Forwarding) versus best-effort web traffic.",
        row: 1
      },
      {
        name: "ECN (Explicit Congestion Notification)",
        bits: "2 bits",
        offset: "Bit 14 to 15",
        defaultValue: "00 (Non-ECT)",
        desc: "Allows intermediate routers experiencing queue congestion to mark packets (11 - CE) without dropping them, triggering TCP window reduction.",
        row: 1
      },
      {
        name: "Total Length",
        bits: "16 bits",
        offset: "Bit 16 to 31",
        defaultValue: "Header + Data size (e.g. 1500)",
        desc: "Total size of the IP datagram (header + payload) in bytes. Maximum theoretical length is 65,535 bytes, though MTU limits it to 1500 bytes on Ethernet.",
        row: 1
      },
      {
        name: "Identification",
        bits: "16 bits",
        offset: "Bit 32 to 47",
        defaultValue: "Unique Datagram ID",
        desc: "A unique identifier assigned by the sender to assist in reassembling fragmented IP packets at the final destination host.",
        row: 2
      },
      {
        name: "Flags",
        bits: "3 bits",
        offset: "Bit 48 to 50",
        defaultValue: "Bit 0: Reserved (0), Bit 1: DF (1=Don't Fragment), Bit 2: MF (0=Last Fragment)",
        desc: "Controls fragmentation behavior. DF=1 instructs routers to drop the packet and send ICMP 'Fragmentation Needed' if it exceeds MTU (used in Path MTU Discovery).",
        row: 2
      },
      {
        name: "Fragment Offset",
        bits: "13 bits",
        offset: "Bit 51 to 63",
        defaultValue: "0 (Units of 8-byte blocks)",
        desc: "Specifies the offset of a fragment relative to the start of the unfragmented datagram in 8-byte (64-bit) units.",
        row: 2
      },
      {
        name: "Time to Live (TTL)",
        bits: "8 bits",
        offset: "Bit 64 to 71",
        defaultValue: "64 or 128",
        desc: "Hop counter decremented by 1 at every router. If TTL reaches 0, the packet is discarded and an ICMP Time Exceeded (Type 11) is sent back (basis for traceroute). Prevents routing loops.",
        row: 3
      },
      {
        name: "Protocol",
        bits: "8 bits",
        offset: "Bit 72 to 79",
        defaultValue: "6 (TCP), 17 (UDP), 1 (ICMP)",
        desc: "Identifies the next-level Layer 4 transport protocol contained in the payload. Enables the destination OS to direct the packet to the correct protocol handler.",
        row: 3
      },
      {
        name: "Header Checksum",
        bits: "16 bits",
        offset: "Bit 80 to 95",
        defaultValue: "16-bit 1's complement sum",
        desc: "Error checking strictly for the IPv4 header fields. Because TTL is decremented at each router hop, this checksum MUST be recalculated at every single router!",
        row: 3
      },
      {
        name: "Source IP Address",
        bits: "32 bits (4 octets)",
        offset: "Bit 96 to 127",
        defaultValue: "e.g. 192.168.1.50",
        desc: "Logical IPv4 address of the originating sender host.",
        row: 4
      },
      {
        name: "Destination IP Address",
        bits: "32 bits (4 octets)",
        offset: "Bit 128 to 159",
        defaultValue: "e.g. 93.184.216.34",
        desc: "Logical IPv4 address of the intended recipient host.",
        row: 5
      },
      {
        name: "Options & Padding (Optional)",
        bits: "0 to 320 bits (0-40 bytes)",
        offset: "Bit 160+",
        defaultValue: "Padding to 32-bit boundary",
        desc: "Security, Record Route, or Timestamp options. Rarely used on modern Internet due to hardware router processing overhead.",
        row: 6
      }
    ]
  },

  ipv6: {
    id: "ipv6",
    name: "IPv6 (Internet Protocol v6 - RFC 8200)",
    layer: 3,
    layerName: "Network Layer",
    pdu: "Packet",
    description: "Next-generation IP protocol offering a 128-bit address space (3.4 × 10^38 addresses), streamlined 40-byte fixed header for high-speed hardware routing, and native autoconfiguration.",
    totalLengthStandard: "Fixed 40 bytes base header (Extension headers follow in chain)",
    fields: [
      {
        name: "Version",
        bits: "4 bits",
        offset: "Bit 0 to 3",
        defaultValue: "0110 (6)",
        desc: "Identifies IPv6 protocol. Binary value 0110.",
        row: 1
      },
      {
        name: "Traffic Class",
        bits: "8 bits",
        offset: "Bit 4 to 11",
        defaultValue: "00000000",
        desc: "Equivalent to IPv4 DSCP and ECN. Facilitates packet priority and congestion notification.",
        row: 1
      },
      {
        name: "Flow Label",
        bits: "20 bits",
        offset: "Bit 12 to 31",
        defaultValue: "Random per-flow tag",
        desc: "Allows routers to identify packets belonging to the same end-to-end communication stream to ensure identical route handling and avoid packet reordering in real-time media.",
        row: 1
      },
      {
        name: "Payload Length",
        bits: "16 bits",
        offset: "Bit 32 to 47",
        defaultValue: "Payload byte size",
        desc: "Size of the payload in bytes, including any chained IPv6 Extension Headers (unlike IPv4 Total Length, does NOT include the 40-byte base header).",
        row: 2
      },
      {
        name: "Next Header",
        bits: "8 bits",
        offset: "Bit 48 to 55",
        defaultValue: "6 (TCP), 17 (UDP), 58 (ICMPv6)",
        desc: "Replaces IPv4 Protocol field. Specifies either the transport protocol or the type of the immediate next Extension Header (e.g. Routing, Hop-by-Hop, Fragmentation).",
        row: 2
      },
      {
        name: "Hop Limit",
        bits: "8 bits",
        offset: "Bit 56 to 63",
        defaultValue: "64",
        desc: "Replaces IPv4 TTL. Decremented by 1 at each router. When 0 is reached, packet is dropped and ICMPv6 Time Exceeded is returned.",
        row: 2
      },
      {
        name: "Source IPv6 Address",
        bits: "128 bits (16 bytes)",
        offset: "Bit 64 to 191 (4 full 32-bit rows)",
        defaultValue: "e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        desc: "128-bit originating source address. Written as 8 groups of 4 hexadecimal characters.",
        row: 3
      },
      {
        name: "Destination IPv6 Address",
        bits: "128 bits (16 bytes)",
        offset: "Bit 192 to 319 (4 full 32-bit rows)",
        defaultValue: "e.g. 2607:f8b0:4004:800::200e",
        desc: "128-bit final destination address.",
        row: 4
      }
    ]
  },

  tcp: {
    id: "tcp",
    name: "TCP (Transmission Control Protocol - RFC 793 / 9293)",
    layer: 4,
    layerName: "Transport Layer",
    pdu: "Segment",
    description: "Connection-oriented, highly reliable transport protocol. Guarantees in-order byte stream delivery, error recovery via retransmissions, flow control via sliding windows, and congestion management.",
    totalLengthStandard: "20 bytes minimum (up to 60 bytes with options)",
    fields: [
      {
        name: "Source Port",
        bits: "16 bits",
        offset: "Bit 0 to 15",
        defaultValue: "e.g. 51820 (Ephemeral)",
        desc: "Port number on originating host (usually dynamic/private 49152-65535). Forms half of the client-side socket.",
        row: 1
      },
      {
        name: "Destination Port",
        bits: "16 bits",
        offset: "Bit 16 to 31",
        defaultValue: "e.g. 80 (HTTP), 443 (HTTPS), 22 (SSH)",
        desc: "Port number of the service process on the destination host (0-1023 well-known).",
        row: 1
      },
      {
        name: "Sequence Number",
        bits: "32 bits",
        offset: "Bit 32 to 63",
        defaultValue: "Initial ISN + bytes sent",
        desc: "Tracks the exact byte position of the data transmitted. In SYN packets, establishes the Initial Sequence Number (ISN) for security.",
        row: 2
      },
      {
        name: "Acknowledgment Number",
        bits: "32 bits",
        offset: "Bit 64 to 95",
        defaultValue: "Next expected Seq #",
        desc: "If ACK flag is set, contains the value of the NEXT sequence number the sender expects to receive from the remote peer.",
        row: 3
      },
      {
        name: "Data Offset (Header Length)",
        bits: "4 bits",
        offset: "Bit 96 to 99",
        defaultValue: "0101 (5 words = 20 bytes)",
        desc: "Specifies TCP header length in 32-bit words (min 5 = 20 bytes, max 15 = 60 bytes with options). Tells receiver where payload data starts.",
        row: 4
      },
      {
        name: "Reserved",
        bits: "3 bits",
        offset: "Bit 100 to 102",
        defaultValue: "000",
        desc: "Reserved for future use; must be zeros.",
        row: 4
      },
      {
        name: "Flags (Control Bits)",
        bits: "9 bits",
        offset: "Bit 103 to 111",
        defaultValue: "SYN, ACK, FIN, RST, PSH, URG, ECE, CWR, NS",
        desc: "Control flags governing connection state: SYN (Establish), ACK (Acknowledge), FIN (Graceful Close), RST (Abrupt Reset), PSH (Push buffer), URG (Urgent pointer).",
        row: 4,
        flagList: [
          { name: "NS", desc: "Nonce Sum (RFC 3540 ECN concealment protection)" },
          { name: "CWR", desc: "Congestion Window Reduced" },
          { name: "ECE", desc: "ECN-Echo (Explicit Congestion Notification)" },
          { name: "URG", desc: "Urgent pointer field significant" },
          { name: "ACK", desc: "Acknowledgment field significant (present on all packets after initial SYN)" },
          { name: "PSH", desc: "Push function (deliver data immediately to application without buffering)" },
          { name: "RST", desc: "Reset connection (refuses connection or recovers from unrecoverable error)" },
          { name: "SYN", desc: "Synchronize sequence numbers (initiates 3-way handshake)" },
          { name: "FIN", desc: "Finish (graceful shutdown: sender has finished transmitting data)" }
        ]
      },
      {
        name: "Window Size",
        bits: "16 bits",
        offset: "Bit 112 to 127",
        defaultValue: "e.g. 64240 bytes",
        desc: "Flow control mechanism. Number of bytes the receiver is currently willing to buffer. Prevents sender from overwhelming receiver buffer.",
        row: 4
      },
      {
        name: "Checksum",
        bits: "16 bits",
        offset: "Bit 128 to 143",
        defaultValue: "16-bit 1's complement",
        desc: "Error checking calculated over a pseudo-header (Source IP, Dest IP, Protocol, TCP length), the TCP header, and the TCP payload.",
        row: 5
      },
      {
        name: "Urgent Pointer",
        bits: "16 bits",
        offset: "Bit 144 to 159",
        defaultValue: "Offset to urgent byte",
        desc: "If URG flag is 1, points to the byte offset from the sequence number marking the end of urgent out-of-band data.",
        row: 5
      },
      {
        name: "Options & Padding",
        bits: "0 to 320 bits (0-40 bytes)",
        offset: "Bit 160+",
        defaultValue: "MSS, Window Scale, SACK, Timestamps",
        desc: "Negotiates parameters like Maximum Segment Size (MSS), Selective Acknowledgment (SACK), and Window Scale factor for gigabit speeds.",
        row: 6
      }
    ]
  },

  udp: {
    id: "udp",
    name: "UDP (User Datagram Protocol - RFC 768)",
    layer: 4,
    layerName: "Transport Layer",
    pdu: "Datagram",
    description: "Lightweight, connectionless transport protocol. Does not establish handshakes, track sequence numbers, or retransmit lost packets. Maximizes speed and minimizes overhead for DNS, VoIP, streaming, and gaming.",
    totalLengthStandard: "Fixed 8 bytes header",
    fields: [
      {
        name: "Source Port",
        bits: "16 bits",
        offset: "Bit 0 to 15",
        defaultValue: "e.g. 53123 (or 0 if unused)",
        desc: "Originating port on sending host. Optional in UDP; set to 0 if the sender expects no reply.",
        row: 1
      },
      {
        name: "Destination Port",
        bits: "16 bits",
        offset: "Bit 16 to 31",
        defaultValue: "e.g. 53 (DNS), 67/68 (DHCP), 123 (NTP)",
        desc: "Destination service port to route datagram to receiving process.",
        row: 1
      },
      {
        name: "Length",
        bits: "16 bits",
        offset: "Bit 32 to 47",
        defaultValue: "Header (8B) + Data length",
        desc: "Total size of UDP datagram (header + data) in bytes. Minimum is 8 bytes (empty datagram).",
        row: 2
      },
      {
        name: "Checksum",
        bits: "16 bits",
        offset: "Bit 48 to 63",
        defaultValue: "16-bit 1's complement",
        desc: "Error detection covering pseudo-header, UDP header, and data. Optional in IPv4 (0 if omitted), but strictly MANDATORY in IPv6.",
        row: 2
      }
    ]
  },

  icmp: {
    id: "icmp",
    name: "ICMP (Internet Control Message Protocol - RFC 792)",
    layer: 3,
    layerName: "Network Layer",
    pdu: "Packet",
    description: "Core network layer reporting protocol. Communicates delivery success, failures (Destination Unreachable), TTL expirations (traceroute), and network diagnostics (ping echo request/reply). Does not correct errors; only reports them.",
    totalLengthStandard: "8 bytes base header + variable data (IP header + 8 bytes of original packet)",
    fields: [
      {
        name: "Type",
        bits: "8 bits",
        offset: "Bit 0 to 7",
        defaultValue: "8 (Echo Request) or 0 (Echo Reply)",
        desc: "Defines the broad category of the ICMP message: 0=Echo Reply, 3=Destination Unreachable, 5=Redirect, 8=Echo Request, 11=Time Exceeded (TTL=0 in transit)."
      },
      {
        name: "Code",
        bits: "8 bits",
        offset: "Bit 8 to 15",
        defaultValue: "0 (Subtype)",
        desc: "Specifies granular reason for the Type. For Type 3: 0=Net Unreachable, 1=Host Unreachable, 3=Port Unreachable, 4=Fragmentation Needed (DF set)."
      },
      {
        name: "Checksum",
        bits: "16 bits",
        offset: "Bit 16 to 31",
        defaultValue: "16-bit 1's complement",
        desc: "Covers the entire ICMP message (header + data) to verify delivery integrity."
      },
      {
        name: "Rest of Header",
        bits: "32 bits (4 bytes)",
        offset: "Bit 32 to 63",
        defaultValue: "Identifier & Sequence Number",
        desc: "Content depends on Type/Code. For Echo Request/Reply: contains 16-bit ID and 16-bit Sequence Number to match requests with responses. For Type 3 Code 4: contains Next-Hop MTU."
      },
      {
        name: "Data Payload",
        bits: "Variable (64+ bits)",
        offset: "Bit 64+",
        defaultValue: "Original IP header + 8 bytes",
        desc: "For error reports, contains the entire original IP header plus the first 8 bytes of the datagram payload that caused the fault, allowing sender to identify which socket errored."
      }
    ]
  },

  arp: {
    id: "arp",
    name: "ARP (Address Resolution Protocol - RFC 826)",
    layer: 2,
    layerName: "Data Link / Network Inter-Layer",
    pdu: "Frame Payload (ARP Message)",
    description: "Resolves known Layer 3 logical IP addresses into Layer 2 physical MAC addresses for local delivery. Relies on broadcast requests ('Who has 192.168.1.1?') and unicast replies ('I have it at 00:1A:2B:3C:4D:5E'). IPv6 replaces ARP with NDP (Neighbor Discovery Protocol).",
    totalLengthStandard: "28 bytes fixed payload within Ethernet frame",
    fields: [
      {
        name: "Hardware Type (HTYPE)",
        bits: "16 bits",
        offset: "Bytes 0 to 1",
        defaultValue: "0x0001 (Ethernet)",
        desc: "Specifies the network link-layer type. 1 represents Ethernet (10Mb/100Mb/1Gb/10Gb)."
      },
      {
        name: "Protocol Type (PTYPE)",
        bits: "16 bits",
        offset: "Bytes 2 to 3",
        defaultValue: "0x0800 (IPv4)",
        desc: "Specifies the internetwork protocol for which the address is resolved (0x0800 for IPv4)."
      },
      {
        name: "Hardware Address Length (HLEN)",
        bits: "8 bits",
        offset: "Byte 4",
        defaultValue: "6 (Ethernet MAC length)",
        desc: "Length in octets of a hardware physical address (6 octets = 48 bits for MAC)."
      },
      {
        name: "Protocol Address Length (PLEN)",
        bits: "8 bits",
        offset: "Byte 5",
        defaultValue: "4 (IPv4 address length)",
        desc: "Length in octets of a logical network address (4 octets = 32 bits for IPv4)."
      },
      {
        name: "Opcode (Operation)",
        bits: "16 bits",
        offset: "Bytes 6 to 7",
        defaultValue: "1 (Request) or 2 (Reply)",
        desc: "Specifies operation: 1 for ARP Request (broadcast), 2 for ARP Reply (unicast), 3 for RARP Request, 4 for RARP Reply."
      },
      {
        name: "Sender Hardware Address (SHA)",
        bits: "48 bits (6 bytes)",
        offset: "Bytes 8 to 13",
        defaultValue: "e.g. 3C:52:82:11:22:33",
        desc: "Physical MAC address of the node sending the ARP message."
      },
      {
        name: "Sender Protocol Address (SPA)",
        bits: "32 bits (4 bytes)",
        offset: "Bytes 14 to 17",
        defaultValue: "e.g. 192.168.1.105",
        desc: "Logical IPv4 address of the node sending the ARP message."
      },
      {
        name: "Target Hardware Address (THA)",
        bits: "48 bits (6 bytes)",
        offset: "Bytes 18 to 23",
        defaultValue: "00:00:00:00:00:00 (in Request)",
        desc: "In an ARP Request, this is zeroed out (unknown). In an ARP Reply, contains target's MAC."
      },
      {
        name: "Target Protocol Address (TPA)",
        bits: "32 bits (4 bytes)",
        offset: "Bytes 24 to 27",
        defaultValue: "e.g. 192.168.1.1",
        desc: "The destination IPv4 address the sender is attempting to map to a MAC address."
      }
    ]
  },

  tls: {
    id: "tls",
    name: "TLS 1.3 Record Layer (RFC 8446)",
    layer: 6,
    layerName: "Presentation Layer",
    pdu: "TLS Record",
    description: "The fundamental framing and cryptographic boundary of the Transport Layer Security protocol. Encapsulates handshake messages, alerts, and application data with Authenticated Encryption with Associated Data (AEAD).",
    totalLengthStandard: "5 bytes header + up to 16,384 bytes ciphertext + 16 bytes auth tag",
    fields: [
      {
        name: "Content Type",
        bits: "8 bits",
        offset: "Byte 0",
        defaultValue: "0x17 (Application Data)",
        desc: "Identifies the higher-level protocol encapsulated: 20 (ChangeCipherSpec), 21 (Alert), 22 (Handshake), 23 (Application Data). In TLS 1.3, encrypted records always set this to 23 for obfuscation, with the real content type hidden inside the ciphertext."
      },
      {
        name: "Legacy Record Version",
        bits: "16 bits",
        offset: "Bytes 1 to 2",
        defaultValue: "0x0303 (TLS 1.2)",
        desc: "Fixed to 0x0303 (TLS 1.2) across all TLS 1.3 records to ensure backward compatibility with middleboxes and legacy proxies that would drop unrecognized record versions."
      },
      {
        name: "Length",
        bits: "16 bits",
        offset: "Bytes 3 to 4",
        defaultValue: "Variable (e.g. 0x0400 = 1024 bytes)",
        desc: "Specifies the length in octets of the following encrypted payload and authentication tag. Cannot exceed 2^14 + 256 octets (16,640 bytes)."
      },
      {
        name: "Encrypted Payload & Inner Content Type",
        bits: "Variable (8 to 131,072 bits)",
        offset: "Bytes 5 to N-16",
        defaultValue: "Ciphertext (AEAD encrypted)",
        desc: "Contains the actual plaintext payload plus optional zero padding, terminated by the 1-byte actual content type (e.g. 0x16 for Handshake, 0x17 for Application Data), all encrypted using the negotiated session key."
      },
      {
        name: "AEAD Authentication Tag (MAC)",
        bits: "128 bits (16 bytes)",
        offset: "Bytes N-15 to N",
        defaultValue: "16-byte Poly1305 / GCM Tag",
        desc: "Cryptographic integrity check generated by the AEAD cipher (e.g. AES-256-GCM, ChaCha20-Poly1305). Guarantees that neither the header nor the ciphertext was tampered with in transit."
      }
    ]
  },

  http2: {
    id: "http2",
    name: "HTTP/2 Binary Framing Layer (RFC 7540)",
    layer: 7,
    layerName: "Application Layer",
    pdu: "HTTP/2 Frame",
    description: "Replaces HTTP/1.1 plain-text newline-delimited requests with standardized binary frames multiplexed over a single TCP connection, eliminating application-layer Head-of-Line blocking.",
    totalLengthStandard: "9 bytes fixed header + variable frame payload (default max 16,384 bytes)",
    fields: [
      {
        name: "Length",
        bits: "24 bits",
        offset: "Bytes 0 to 2",
        defaultValue: "e.g. 0x000100 (256 bytes)",
        desc: "The length of the frame payload in octets. Default maximum frame size is 16,384 bytes (2^14); can be negotiated up to 16,777,215 octets via SETTINGS_MAX_FRAME_SIZE."
      },
      {
        name: "Type",
        bits: "8 bits",
        offset: "Byte 3",
        defaultValue: "0x01 (HEADERS) / 0x00 (DATA)",
        desc: "Frame type determining payload semantics: 0x0 DATA, 0x1 HEADERS, 0x2 PRIORITY, 0x3 RST_STREAM, 0x4 SETTINGS, 0x5 PUSH_PROMISE, 0x6 PING, 0x7 GOAWAY, 0x8 WINDOW_UPDATE, 0x9 CONTINUATION."
      },
      {
        name: "Flags",
        bits: "8 bits",
        offset: "Byte 4",
        defaultValue: "0x05 (END_STREAM | END_HEADERS)",
        desc: "Bitmask modifying frame behavior. Key flags include 0x1 END_STREAM (signals the sender is done transmitting on this stream) and 0x4 END_HEADERS (signals complete header block without continuation)."
      },
      {
        name: "Reserved Bit (R)",
        bits: "1 bit",
        offset: "Byte 5 (Bit 0)",
        defaultValue: "0b0",
        desc: "Unassigned 1-bit field reserved for future semantics. Must be set to 0 by senders and ignored by receivers."
      },
      {
        name: "Stream Identifier",
        bits: "31 bits",
        offset: "Bytes 5 (Bits 1-7) to 8",
        defaultValue: "e.g. 0x00000001 (Stream 1)",
        desc: "Uniquely identifies the independent bidirectional stream this frame belongs to. Stream 0 is reserved for connection-level control frames (SETTINGS, PING, WINDOW_UPDATE). Client-initiated streams use odd numbers; server-initiated push streams use even numbers."
      },
      {
        name: "Frame Payload",
        bits: "Variable (0 to 134,217,720 bits)",
        offset: "Bytes 9 to N",
        defaultValue: "HPACK Headers / Binary Data",
        desc: "The actual content of the frame, such as HPACK-compressed HTTP header fields (HEADERS), application message chunks (DATA), or protocol configuration parameters (SETTINGS)."
      }
    ]
  },

  dns: {
    id: "dns",
    name: "DNS Message Format (RFC 1035)",
    layer: 7,
    layerName: "Application Layer",
    pdu: "DNS Message",
    description: "The core hierarchical naming protocol of the Internet. Resolves human-readable domain names (FQDNs) to numeric IP addresses using UDP/TCP port 53.",
    totalLengthStandard: "12 bytes fixed header + variable question/answer resource records",
    fields: [
      {
        name: "Transaction ID (XID)",
        bits: "16 bits",
        offset: "Bytes 0 to 1",
        defaultValue: "e.g. 0x4A1F",
        desc: "Random 16-bit identifier generated by the client resolver to correlate asynchronous responses with outbound queries. Modern resolvers randomize this to mitigate DNS cache poisoning."
      },
      {
        name: "Flags & Control Codes",
        bits: "16 bits",
        offset: "Bytes 2 to 3",
        defaultValue: "0x0120 (Standard Query, RD set)",
        desc: "Bitfield specifying message parameters: QR (1b: 0=Query, 1=Response), Opcode (4b: 0=Standard Query), AA (1b: Authoritative Answer), TC (1b: Truncated), RD (1b: Recursion Desired), RA (1b: Recursion Available), Z (3b: Reserved), RCODE (4b: Response Code: 0=NoError, 3=NXDomain)."
      },
      {
        name: "Questions Count (QDCOUNT)",
        bits: "16 bits",
        offset: "Bytes 4 to 5",
        defaultValue: "0x0001 (1 question)",
        desc: "Specifies the number of entries in the Question section (typically 1 in standard queries)."
      },
      {
        name: "Answer RRs Count (ANCOUNT)",
        bits: "16 bits",
        offset: "Bytes 6 to 7",
        defaultValue: "0x0000 (Query) / 0x0002 (Reply)",
        desc: "Specifies the number of Resource Records (RRs) returned in the Answer section."
      },
      {
        name: "Authority RRs Count (NSCOUNT)",
        bits: "16 bits",
        offset: "Bytes 8 to 9",
        defaultValue: "0x0000 / Variable",
        desc: "Specifies the number of authoritative name server resource records in the Authority section."
      },
      {
        name: "Additional RRs Count (ARCOUNT)",
        bits: "16 bits",
        offset: "Bytes 10 to 11",
        defaultValue: "0x0001 (EDNS0 Opt RR)",
        desc: "Specifies the number of resource records in the Additional Records section (e.g. EDNS0 buffer size advertisement)."
      }
    ]
  },

  dhcp: {
    id: "dhcp",
    name: "DHCP / BOOTP Message (RFC 2131)",
    layer: 7,
    layerName: "Application Layer",
    pdu: "DHCP Datagram Payload",
    description: "Automates network host configuration (IP address, subnet mask, default gateway, and DNS servers) via UDP ports 67 (Server) and 68 (Client) across the 4-stage DORA handshake.",
    totalLengthStandard: "240 bytes fixed base + variable options (typically 300 to 576 bytes)",
    fields: [
      {
        name: "Message Opcode (OP)",
        bits: "8 bits",
        offset: "Byte 0",
        defaultValue: "1 (BOOTREQUEST) / 2 (BOOTREPLY)",
        desc: "Specifies message direction: 1 represents a Client Request (BOOTREQUEST), 2 represents a Server Reply (BOOTREPLY)."
      },
      {
        name: "Hardware Type (HTYPE) & Length (HLEN)",
        bits: "16 bits",
        offset: "Bytes 1 to 2",
        defaultValue: "0x01 0x06 (Ethernet, 6-byte MAC)",
        desc: "HTYPE=1 specifies Ethernet; HLEN=6 specifies a 48-bit (6 octet) hardware address."
      },
      {
        name: "Hops",
        bits: "8 bits",
        offset: "Byte 3",
        defaultValue: "0",
        desc: "Set to 0 by the client; incremented by DHCP Relay Agents forwarding requests across subnet boundaries."
      },
      {
        name: "Transaction ID (XID)",
        bits: "32 bits",
        offset: "Bytes 4 to 7",
        defaultValue: "e.g. 0x39A2F1C4",
        desc: "Random 32-bit integer chosen by the client to correlate messages throughout the Discover-Offer-Request-Ack exchange."
      },
      {
        name: "Seconds Elapsed (SECS) & Flags",
        bits: "32 bits",
        offset: "Bytes 8 to 11",
        defaultValue: "0x0000 0x8000 (Broadcast Flag)",
        desc: "Seconds since client began lease acquisition. Flags Bit 0 is the Broadcast Flag (if 1, server must broadcast reply because client lacks an IP)."
      },
      {
        name: "Client IP (ciaddr)",
        bits: "32 bits",
        offset: "Bytes 12 to 15",
        defaultValue: "0.0.0.0 (in Discover)",
        desc: "Client's current IP address; only populated when client is in BOUND, RENEW, or REBINDING state."
      },
      {
        name: "Your Assigned IP (yiaddr)",
        bits: "32 bits",
        offset: "Bytes 16 to 19",
        defaultValue: "e.g. 192.168.1.105",
        desc: "The IP address offered/assigned by the DHCP server to the client."
      },
      {
        name: "Server IP (siaddr) & Gateway IP (giaddr)",
        bits: "64 bits (8 bytes)",
        offset: "Bytes 20 to 27",
        defaultValue: "siaddr: 192.168.1.1, giaddr: 0.0.0.0",
        desc: "siaddr identifies the next bootstrap server; giaddr records the IP of any relay agent traversed."
      },
      {
        name: "Client Hardware Address (chaddr)",
        bits: "128 bits (16 bytes)",
        offset: "Bytes 28 to 43",
        defaultValue: "e.g. 3C:52:82:11:22:33 (padded)",
        desc: "Client's physical MAC address (first 6 octets) followed by 10 zeroed padding octets."
      },
      {
        name: "Magic Cookie",
        bits: "32 bits",
        offset: "Bytes 236 to 239",
        defaultValue: "0x63825363",
        desc: "Standard 4-octet magic cookie required by RFC 2131 to signify that vendor-specific DHCP options follow."
      },
      {
        name: "DHCP Options (TLV Format)",
        bits: "Variable (Tag-Length-Value)",
        offset: "Bytes 240 to End",
        defaultValue: "Opt 53 (Msg Type), Opt 1 (Mask), Opt 3 (Router), Opt 6 (DNS)",
        desc: "Dynamic configuration parameters: Option 53 specifies message type (1=Discover, 2=Offer, 3=Request, 5=Ack), Option 1 supplies Subnet Mask, Option 3 supplies Default Gateway, Option 6 supplies DNS servers, terminated by Option 255 (End)."
      }
    ]
  }
};

const LAYER_DETAILS = {
  1: {
    num: 1,
    name: "Physical Layer",
    color: "#c084fc",
    accent: "purple",
    pdu: "Bits",
    mnemonic: "Bits ('Birthdays')",
    hardware: "Cables (Cat5e/6/6a UTP/STP, Fiber), Hubs, Repeaters, Transceivers, Wireless AP Antennas",
    protocols: "1000BASE-T, 10GBASE-SR, 802.11a/b/g/n/ac/ax RF, RS-232, DSL, DOCSIS",
    summary: "Transmits unstructured raw binary bitstreams across physical transmission media via voltage levels, light pulses, or radio frequencies.",
    deepDive: {
      signaling: "Converts binary 1s and 0s into physical signals. Copper uses electrical voltage levels (e.g. NRZ, Manchester, PAM-4 in 10Gbps Ethernet). Fiber uses light wavelengths via lasers/LEDs. Wireless uses electromagnetic radio wave modulation (QAM, OFDM).",
      topologies: [
        { name: "Star", desc: "All devices connect to a central hub/switch. Most scalable, single point of failure is central device." },
        { name: "Mesh", desc: "Every device connected to multiple or all devices. Highest redundancy and fault tolerance, very costly." },
        { name: "Bus", desc: "Single continuous backbone cable terminated with resistors. Single break halts entire network." },
        { name: "Ring", desc: "Nodes connected in a closed loop passing sequential tokens. Unidirectional or dual-ring FDDI." }
      ],
      cablingStandards: "TIA/EIA-568A and TIA/EIA-568B pinout configurations for RJ-45 twisted pair copper cabling. Straight-through cables connect dissimilar devices (PC to Switch); Crossover cables connect similar devices (PC to PC, Switch to Switch - largely obsoleted by Auto-MDIX).",
      pduExplanation: "At Layer 1, data has NO header or trailer. It is simply a serialized stream of physical pulses/bits traversing the medium."
    }
  },
  2: {
    num: 2,
    name: "Data Link Layer",
    color: "#34d399",
    accent: "green",
    pdu: "Frame",
    mnemonic: "Frames ('Flavor')",
    hardware: "Network Interface Cards (NICs), Layer 2 Switches, Bridges, Wireless Access Points",
    protocols: "Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11), ARP, PPP, HDLC, Frame Relay",
    summary: "Provides reliable node-to-node data transfer across a local subnet. Structures raw bits into frames, performs hardware (MAC) addressing, collision control, and error detection via CRC.",
    deepDive: {
      macAddressing: "48-bit (6 octets) static physical address burned into the NIC. Written as XX:XX:XX:XX:XX:XX. First 24 bits = OUI (Organizationally Unique Identifier assigned by IEEE to vendor). Last 24 bits = unique device/extension identifier.",
      addressTypes: [
        { type: "Unicast", example: "00:1A:2B:3C:4D:5E", desc: "Destination is a single specific NIC on the local broadcast domain." },
        { type: "Multicast", example: "01:00:5E:00:00:01", desc: "Delivered to a group of subscribed nodes on the local link." },
        { type: "Broadcast", example: "FF:FF:FF:FF:FF:FF", desc: "Sent to all nodes on the local subnet (e.g. ARP Requests, DHCP Discover)." }
      ],
      switchOperation: "Switches inspect Source MAC addresses to populate the CAM table (MAC-to-port mapping). When forwarding, switches look up Destination MAC: if known, forward out that specific port; if unknown or broadcast, flood out all ports except arrival port.",
      trailerDeepDive: "Layer 2 is uniquely equipped with a Trailer (FCS / CRC-32) because NIC hardware verifies frame validity immediately upon completion of transmission, discarding defective frames before OS involvement.",
      mtuAndFraming: "Standard Ethernet MTU is 1500 bytes (resulting in 64-1518 byte frames). Exceptions: 802.1Q VLAN tagging inserts a 4-byte tag (up to 1522 bytes); Enterprise networks and SANs support Jumbo Frames with MTUs up to 9,198 bytes.",
      arpMechanics: "ARP maps IP to MAC via broadcast requests and unicast replies. Entries are Dynamic (cached from broadcasts) or Static (manually configured). Security issues: Duplicate MAC addresses cause switch CAM table fluttering; ARP spoofing redirects local traffic maliciously."
    }
  },
  3: {
    num: 3,
    name: "Network Layer",
    color: "#38bdf8",
    accent: "blue",
    pdu: "Packet",
    mnemonic: "Packets ('Peanut')",
    hardware: "Routers, Layer 3 Multilayer Switches, Gateways, Firewalls",
    protocols: "IPv4, IPv6, ICMP, ICMPv6, ARP (inter-layer), OSPF, EIGRP, BGP, RIP",
    summary: "Handles end-to-end logical addressing and path determination (routing) across interconnected networks. Encapsulates transport segments into packets.",
    deepDive: {
      ipv4Classes: [
        { class: "Class A", range: "1.0.0.0 – 126.255.255.255", defaultMask: "255.0.0.0 (/8)", networks: "126", hostsPerNet: "16,777,214" },
        { class: "Class B", range: "128.0.0.0 – 191.255.255.255", defaultMask: "255.255.0.0 (/16)", networks: "16,384", hostsPerNet: "65,534" },
        { class: "Class C", range: "192.0.0.0 – 223.255.255.255", defaultMask: "255.255.255.0 (/24)", networks: "2,097,152", hostsPerNet: "254" },
        { class: "Class D", range: "224.0.0.0 – 239.255.255.255", defaultMask: "N/A (Multicast)", networks: "Multicast Groups", hostsPerNet: "N/A" },
        { class: "Class E", range: "240.0.0.0 – 254.255.255.255", defaultMask: "N/A (Experimental)", networks: "Research/Reserved", hostsPerNet: "N/A" }
      ],
      specialIPs: [
        { ip: "127.0.0.1", desc: "Loopback address (self-reference testing without physical link)" },
        { ip: "169.254.0.1 – 169.254.255.254", desc: "APIPA (Automatic Private IP Addressing) assigned when DHCP server fails" },
        { ip: "255.255.255.255", desc: "Limited local broadcast address" },
        { ip: "0.0.0.0", desc: "Default route / unassigned address" }
      ],
      privateRanges: [
        { range: "10.0.0.0 – 10.255.255.255", cidr: "10.0.0.0/8", type: "Class A Private" },
        { range: "172.16.0.0 – 172.31.255.255", cidr: "172.16.0.0/12", type: "Class B Private (16 contiguous /16 blocks)" },
        { range: "192.168.0.0 – 192.168.255.255", cidr: "192.168.0.0/16", type: "Class C Private (256 contiguous /24 blocks)" }
      ],
      ipv6Types: [
        { type: "Global Unicast", prefix: "2000::/3", desc: "Publicly routable on the global Internet (first 3 bits always 001)." },
        { type: "Link-Local Unicast", prefix: "fe80::/64", desc: "Non-routable, strictly for local link segment communication. Autoconfigured via SLAAC or EUI-64." },
        { type: "Unique Local", prefix: "fc00::/7 & fd00::/8", desc: "Equivalent to IPv4 private addresses for internal organization routing." },
        { type: "Multicast", prefix: "ff00::/8", desc: "Replaces IPv4 broadcasting; delivered to subscribed groups." },
        { type: "Loopback", prefix: "::1/128", desc: "IPv6 local loopback." }
      ],
      routingArchitecture: {
        routerRoles: [
          { role: "Core / Interior Routers", desc: "Direct traffic strictly between subnets within the same Autonomous System (AS)." },
          { role: "Edge / Border Routers", desc: "Positioned at perimeter of an AS to connect with external ISPs and other networks." },
          { role: "Exterior Routers", desc: "Operate outside the organization's AS, directing traffic between separate Autonomous Systems across the Internet." }
        ],
        layer3SwitchVsRouter: "A Layer 3 Switch routes IP packets using specialized hardware Application-Specific Integrated Circuits (ASICs), making packet forwarding much faster and cheaper than software-based traditional routers. However, routers support diverse WAN interfaces and complex NAT/firewall policies.",
        metricsAndAD: [
          { metric: "Hop Count", desc: "Number of router hops (RIP limit = 15)." },
          { metric: "Bandwidth & Throughput", desc: "Theoretical capacity vs actual measured data flow." },
          { metric: "Delay / Latency", desc: "Time for packet to traverse the path." },
          { metric: "Cost", desc: "Arbitrary metric assigned by network engineers or inversely proportional to link bandwidth (OSPF)." },
          { metric: "Administrative Distance (AD)", desc: "Reliability score: Connected=0, Static=1, eBGP=20, EIGRP=90, OSPF=110, RIP=120." }
        ],
        routingProtocols: [
          { name: "RIP / RIPv2", type: "IGP", algorithm: "Distance-Vector", metric: "Hop count (max 15)", desc: "Periodic broadcast updates, slow convergence, obsolete on enterprise backbones." },
          { name: "OSPF", type: "IGP", algorithm: "Link-State", metric: "Cost (Bandwidth)", desc: "Dijkstra SPF algorithm, area hierarchy, zero hop limit, fast convergence." },
          { name: "IS-IS", type: "IGP", algorithm: "Link-State", metric: "Cost", desc: "Core ISP backbone protocol; scalable with native IPv6 support." },
          { name: "EIGRP", type: "IGP", algorithm: "Advanced Distance-Vector (Hybrid)", metric: "Bandwidth + Delay", desc: "Cisco DUAL algorithm, composite metric, low network overhead." },
          { name: "BGP", type: "EGP", algorithm: "Path-Vector", metric: "AS-Path & Policies", desc: "The 'Protocol of the Internet', coordinates routing between Autonomous Systems." }
        ]
      }
    }
  },
  4: {
    num: 4,
    name: "Transport Layer",
    color: "#fbbf24",
    accent: "amber",
    pdu: "Segment (TCP) / Datagram (UDP)",
    mnemonic: "Segments ('Some')",
    hardware: "End-host operating systems, Layer 4 Application/Content Switches, Stateful Firewalls",
    protocols: "TCP (Transmission Control Protocol), UDP (User Datagram Protocol)",
    summary: "Facilitates end-to-end process-to-process communication across hosts using port numbers. Divides messages into segments/datagrams and manages reliability and flow control.",
    deepDive: {
      socketConcept: "A Socket uniquely identifies an endpoint process on the network and consists of [IP Address] + [Port Number] (e.g. 192.168.1.100:443 or 10.43.3.87:23).",
      layer4Switches: "Layer 4 Switches (also known as Content or Application Switches) inspect TCP/UDP port headers. This enables advanced application load balancing, SSL termination, and session persistence (sticky sessions) at network backbones.",
      portRanges: [
        { range: "0 – 1023", name: "Well-Known Ports", desc: "Assigned by IANA to system-level server processes (e.g. 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 443 HTTPS)." },
        { range: "1024 – 49151", name: "Registered Ports", desc: "Registered with IANA by software vendors for specific custom applications (e.g. 1433 MSSQL, 3306 MySQL, 3389 RDP, 8080 HTTP-Alt)." },
        { range: "49152 – 65535", name: "Dynamic / Private / Ephemeral Ports", desc: "Assigned dynamically by client operating systems as temporary source ports for outbound communication sessions." }
      ],
      tcpVsUdp: [
        { metric: "Connection Model", tcp: "Connection-oriented (Requires 3-way Handshake)", udp: "Connectionless (Fire-and-forget, no setup)" },
        { metric: "Delivery Guarantee", tcp: "Guaranteed reliable (Retransmits lost segments)", udp: "Best-effort (No retransmissions or loss detection)" },
        { metric: "Packet Ordering", tcp: "Strictly ordered via 32-bit Sequence Numbers", udp: "Out-of-order delivery possible" },
        { metric: "Flow / Congestion Control", tcp: "Sliding window and congestion algorithms (Tahoe, Reno, BBR)", udp: "None (Transmits at application rate)" },
        { metric: "Header Overhead", tcp: "20 to 60 bytes", udp: "Fixed 8 bytes" },
        { metric: "Speed & Latency", tcp: "Higher latency due to ACKs and handshakes", udp: "Ultra-low latency, immediate transmission" },
        { metric: "Primary Use Cases", tcp: "Web (HTTP/S), Email (SMTP), File transfer (FTP/SFTP), SSH", udp: "DNS, DHCP, VoIP, Live video streaming, Online multiplayer gaming" }
      ]
    }
  },
  5: {
    num: 5,
    name: "Session Layer",
    color: "#fb7185",
    accent: "rose",
    pdu: "Data / Session PDU",
    mnemonic: "Sausage ('Please Do Not Throw Sausage Pizza Away')",
    hardware: "Operating System Socket Runtimes, RPC Subsystems, Session Border Controllers, SOCKS Gateways",
    protocols: "NetBIOS, RPC (Remote Procedure Call), SOCKS5, PPTP, SMB, SIP, TLS Session Resumption",
    summary: "Establishes, manages, synchronizes, and terminates dialogues (sessions) between communicating applications. Controls dialogue direction (simplex, half-duplex, full-duplex) and sets checkpoints for fault recovery.",
    deepDive: {
      dialogueModes: [
        { mode: "Simplex", description: "Unidirectional data transfer. One station transmits exclusively while the other receives (e.g., broadcast telemetry, radio beacons)." },
        { mode: "Half-Duplex", description: "Two-way communication, but only one direction at a time. Requires token-passing or collision avoidance so parties take turns (e.g., classic walkie-talkie, HTTP/1.1 request-response alternation)." },
        { mode: "Full-Duplex", description: "Simultaneous bidirectional communication. Both endpoints send and receive concurrently over independent channel paths (e.g., modern TCP sockets, WebSockets, telephone calls)." }
      ],
      checkpoints: "Major synchronization points require explicit acknowledgement from the receiving entity and divide the dialogue into atomic transaction units. Minor synchronization points provide intermediate checkpoints within a transaction; if an interruption occurs, transmission can resume from the last minor checkpoint rather than restarting from zero.",
      tokenManagement: "In half-duplex or shared access dialogues, the session layer uses software tokens (Data Token, Synchronize Token, Release Token) to determine which entity has permission to transmit or terminate the connection.",
      modernRelevance: "In modern TCP/IP suites, Layer 5 functionality is typically folded into application protocols or transport security layers (e.g., HTTP/2 stream multiplexing, TLS 1.3 Session Tickets / 0-RTT resumption, RPC call-response correlation, and WebSocket persistent sessions).",
      keyProtocols: [
        { name: "SOCKS5 (RFC 1928)", role: "Authentication & proxy routing protocol at the session layer for generic TCP/UDP traffic." },
        { name: "RPC (RFC 1831)", role: "Enables client programs to invoke subroutines executing on remote address spaces transparently." },
        { name: "NetBIOS (RFC 1001/1002)", role: "Local network name registration, session establishment, and datagram services in legacy Windows networks." },
        { name: "SIP (RFC 3261)", role: "Initiates, modifies, and terminates multimedia sessions (VoIP, video conferencing)." }
      ]
    }
  },
  6: {
    num: 6,
    name: "Presentation Layer",
    color: "#2dd4bf",
    accent: "teal",
    pdu: "Data / Formatted Data",
    mnemonic: "Pizza ('Please Do Not Throw Sausage Pizza Away')",
    hardware: "OS Presentation Subsystems, Cryptographic Accelerators (e.g. AES-NI), Codecs & Transcoders",
    protocols: "TLS 1.3 (Record/Handshake), ASN.1 (BER/DER), MIME, XDR, Gzip/Brotli, JSON, Protocol Buffers",
    summary: "Transforms data into a mutually agreed syntactical format between heterogeneous systems. Handles character code translation, data compression, serialization/deserialization, and cryptographic presentation (encryption/decryption).",
    deepDive: {
      syntaxConcepts: "Distinguishes between Abstract Syntax (the conceptual structure of data, e.g. ASN.1 schemas or Protobuf definitions) and Transfer Syntax (the concrete byte-level encoding on the wire, e.g. Basic Encoding Rules (BER), Distinguished Encoding Rules (DER), or compact binary wire format).",
      endianness: "Network Byte Order is strictly Big-Endian (Most Significant Byte at lowest memory address, standard RFC 1700). Host Byte Order varies by architecture (x86_64 and ARM are Little-Endian). Layer 6/socket APIs use standard conversion routines: htons() (host-to-network short), htonl() (host-to-network long), ntohs(), and ntohl().",
      serializationMatrix: [
        { format: "JSON", encoding: "Text (UTF-8)", efficiency: "Moderate (verbose keys)", schema: "Optional (JSON Schema)", useCase: "Web APIs, REST, human-readable config" },
        { format: "ASN.1 (DER)", encoding: "Binary (TLV)", efficiency: "High (compact bytes)", schema: "Strict / Deterministic", useCase: "X.509 Certificates, TLS Handshake, Cryptographic signatures" },
        { format: "Protocol Buffers", encoding: "Binary (varint/tags)", efficiency: "Very High (smallest payload)", schema: "Strict (.proto compiled)", useCase: "gRPC microservices, high-throughput RPC systems" },
        { format: "XDR (RFC 4506)", encoding: "Binary (4-byte aligned)", efficiency: "High (simple padding)", schema: "Strict (RFC spec)", useCase: "NFS (Network File System), Sun RPC" }
      ],
      cryptoPresentation: "Handles the presentation of encrypted records versus plaintext data. In TLS 1.3, the record layer encapsulates encrypted application plaintext and signs it with an Authenticated Encryption with Associated Data (AEAD) tag (e.g., AES-GCM or ChaCha20-Poly1305), ensuring data confidentiality, integrity, and authenticity.",
      characterEncoding: "Translates between differing character sets (e.g., historical EBCDIC on IBM mainframes to standard ASCII and UTF-8 multibyte representation)."
    }
  },
  7: {
    num: 7,
    name: "Application Layer",
    color: "#818cf8",
    accent: "indigo",
    pdu: "Data / Application Message",
    mnemonic: "Away ('Please Do Not Throw Sausage Pizza Away')",
    hardware: "End-User Applications, Web Browsers, Mail User Agents (MUA), DNS Resolvers, Web/Application Servers",
    protocols: "HTTP/1.1, HTTP/2, HTTP/3 (QUIC), DNS, DHCP, SSH, SMTP, IMAP, SNMP, NTP, FTP",
    summary: "Provides network services directly to end-user software applications and human operators. Exposes high-level standardized protocols for web navigation, name resolution, automated network addressing, secure shell access, and email exchange.",
    deepDive: {
      httpEvolution: [
        { version: "HTTP/1.1 (1997)", transport: "TCP", framing: "Plaintext Textual", mux: "No (Pipeline head-of-line blocking)", compression: "None for headers, Gzip body", handshake: "1x TCP RTT + TLS RTT" },
        { version: "HTTP/2 (2015)", transport: "TCP", framing: "Binary Framing (Streams/Frames)", mux: "Full multiplexing over single TCP connection", compression: "HPACK Header Compression", handshake: "1x TCP RTT + TLS 1.3 RTT" },
        { version: "HTTP/3 (2022)", transport: "QUIC (UDP)", framing: "Binary QUIC Streams", mux: "Independent stream flow (Zero HOL blocking)", compression: "QPACK Header Compression", handshake: "0-RTT to 1-RTT Unified Handshake" }
      ],
      dnsArchitecture: "DNS forms a global hierarchical, distributed database. The resolution tree begins at 13 logical Root Nameserver clusters (named a.root-servers.net through m.root-servers.net, backed by hundreds of Anycast nodes globally), delegates to Top-Level Domain (TLD) authoritative servers (.com, .org, .edu), and concludes at Authoritative Nameservers for the specific domain. Resolvers operate either recursively (client delegates full search to ISP/recursive resolver) or iteratively (resolver queries each hierarchical tier sequentially).",
      dhcpDora: [
        { step: "D - Discover", type: "Broadcast", desc: "Client broadcasts DHCPDISCOVER (0.0.0.0:68 -> 255.255.255.255:67) seeking an address." },
        { step: "O - Offer", type: "Unicast / Broadcast", desc: "DHCP server responds with DHCPOFFER proposing yiaddr (Your IP), lease time, subnet mask, and default router." },
        { step: "R - Request", type: "Broadcast", desc: "Client broadcasts DHCPREQUEST formally requesting offered lease and notifying other DHCP servers." },
        { step: "A - Acknowledge", type: "Unicast / Broadcast", desc: "Server commits lease and replies with DHCPACK containing configuration options (DNS, Gateway)." }
      ],
      emailArchitecture: "Email operates on a dual-protocol store-and-forward model: SMTP (Simple Mail Transfer Protocol, TCP 25/587) handles client-to-server and server-to-server push delivery (MTA). User retrieval is handled by pull protocols: IMAP (TCP 993, leaves mail on server with multi-folder sync) or POP3 (TCP 995, downloads and historically removes from server)."
    }
  }
};
