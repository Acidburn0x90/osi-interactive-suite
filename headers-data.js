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
      trailerDeepDive: "Layer 2 is uniquely equipped with a Trailer (FCS / CRC-32) because NIC hardware verifies frame validity immediately upon completion of transmission, discarding defective frames before OS involvement."
    }
  },
  3: {
    num: 3,
    name: "Network Layer",
    color: "#38bdf8",
    accent: "blue",
    pdu: "Packet",
    mnemonic: "Packets ('Peanut')",
    hardware: "Routers, Layer 3 Switches, Gateways, Firewalls",
    protocols: "IPv4, IPv6, ICMP, ICMPv6, ARP (inter-layer), OSPF, BGP, RIP",
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
      ]
    }
  },
  4: {
    num: 4,
    name: "Transport Layer",
    color: "#fbbf24",
    accent: "amber",
    pdu: "Segment (TCP) / Datagram (UDP)",
    mnemonic: "Segments ('Some')",
    hardware: "End-host operating systems, Layer 4 Load Balancers, Stateful Firewalls",
    protocols: "TCP (Transmission Control Protocol), UDP (User Datagram Protocol)",
    summary: "Facilitates end-to-end process-to-process communication across hosts using port numbers. Divides messages into segments/datagrams and manages reliability and flow control.",
    deepDive: {
      socketConcept: "A Socket uniquely identifies an endpoint process on the network and consists of [IP Address] + [Port Number] (e.g. 192.168.1.100:443 or 10.43.3.87:23).",
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
  }
};
