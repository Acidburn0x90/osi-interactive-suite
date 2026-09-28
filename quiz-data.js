/**
 * CSCI 250 Networking Exam & OSI Mastery Quiz Bank
 * Sourced directly from CSCI 250 Chapters 1-3, Exam Reviews, Lab A5, and PDU Specifications.
 */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    layer: 2,
    question: "Traditional MAC addresses are 48 bits long. What do the first 24 bits represent, and who assigns them?",
    options: [
      "Device ID assigned by the local network administrator",
      "Organizationally Unique Identifier (OUI) assigned by the IEEE",
      "Network Prefix assigned by IANA",
      "Subnet mask assigned by the DHCP server"
    ],
    answer: 1,
    explanation: "The first 24 bits (3 octets) of a MAC address form the OUI (Organizationally Unique Identifier), which is assigned by the IEEE to hardware manufacturers. The remaining 24 bits identify the specific NIC."
  },
  {
    id: 2,
    layer: 2,
    question: "Why does the Layer 2 Ethernet Frame uniquely contain a Trailer (FCS / CRC-32), while upper layers rely on Headers?",
    options: [
      "Because Ethernet cables can only transmit error codes at the very end of a wire",
      "Because hardware transceivers compute the CRC polynomial on-the-fly as bits stream through, allowing instant validation upon arrival without buffering",
      "Because IPv4 and IPv6 do not have any form of error checking",
      "Because trailers are required by the operating system's kernel to locate memory"
    ],
    answer: 1,
    explanation: "As bits stream across the physical wire, the transmitting NIC calculates the CRC-32 in dedicated hardware registers and appends it as the final 4 bytes. The receiving NIC computes the checksum simultaneously and drops bad frames immediately before passing them to CPU memory."
  },
  {
    id: 3,
    layer: 4,
    question: "Which of the following describes the correct order of Protocol Data Units (PDUs) from Layer 4 down to Layer 1?",
    options: [
      "Packets → Segments → Frames → Bits",
      "Segments → Packets → Frames → Bits",
      "Frames → Packets → Segments → Bits",
      "Datagrams → Frames → Packets → Bits"
    ],
    answer: 1,
    explanation: "The standard sequence from Layer 4 to Layer 1 is: Segment/Datagram (L4) → Packet (L3) → Frame (L2) → Bits (L1). Remember the mnemonic: 'Don't Spill Peanut Flavor Bits' (Data, Segments, Packets, Frames, Bits)."
  },
  {
    id: 4,
    layer: 4,
    question: "What is the primary operational difference between TCP and UDP at Layer 4?",
    options: [
      "TCP is connectionless and lightweight; UDP requires a 3-way handshake",
      "TCP is connection-oriented and guarantees in-order, reliable delivery via acknowledgments; UDP is connectionless fire-and-forget",
      "TCP operates at Layer 3, whereas UDP operates at Layer 4",
      "TCP uses 8-byte headers, whereas UDP uses 20-byte headers"
    ],
    answer: 1,
    explanation: "TCP is connection-oriented, requiring a 3-way handshake (SYN, SYN-ACK, ACK), sequence numbers, and retransmissions for reliability. UDP is connectionless with an 8-byte header and no retransmissions, ideal for live video, DNS, and gaming."
  },
  {
    id: 5,
    layer: 3,
    question: "A Windows client configured for DHCP fails to reach a DHCP server and self-assigns the IP 169.254.45.12. What mechanism is active?",
    options: [
      "SLAAC (Stateless Address Autoconfiguration)",
      "APIPA (Automatic Private IP Addressing)",
      "Dynamic NAT (Network Address Translation)",
      "Default Loopback fallback"
    ],
    answer: 1,
    explanation: "APIPA assigns addresses in the 169.254.0.1 through 169.254.255.254 range (/16) when a DHCP server is unavailable, permitting communication only within the local subnet."
  },
  {
    id: 6,
    layer: 3,
    question: "Which classful IPv4 address range is designated as Class B, and what is its default subnet mask?",
    options: [
      "1.0.0.0 to 126.255.255.255 with mask 255.0.0.0 (/8)",
      "128.0.0.0 to 191.255.255.255 with mask 255.255.0.0 (/16)",
      "192.0.0.0 to 223.255.255.255 with mask 255.255.255.0 (/24)",
      "224.0.0.0 to 239.255.255.255 with no default mask (Multicast)"
    ],
    answer: 1,
    explanation: "Class B covers 128.0.0.0 through 191.255.255.255 with a default /16 subnet mask (255.255.0.0), offering approximately 16,384 networks and 65,534 usable hosts per network."
  },
  {
    id: 7,
    layer: 3,
    question: "Why was the Header Checksum field removed from the IPv6 base header (in contrast to IPv4)?",
    options: [
      "IPv6 does not care about transmission errors",
      "To improve router forwarding speed and reduce latency, since Layer 2 (Ethernet CRC) and Layer 4 (TCP/UDP) already enforce checksums",
      "IPv6 cables have zero bit error rates",
      "Because IPv6 packets cannot be routed over wireless networks"
    ],
    answer: 1,
    explanation: "In IPv4, routers must recompute the header checksum at every single hop because TTL decrements. In IPv6, the header checksum was eliminated to streamline router processing; error detection is delegated to Layer 2 (FCS) and Layer 4."
  },
  {
    id: 8,
    layer: 4,
    question: "What constitutes a network 'Socket'?",
    options: [
      "A MAC address combined with an IP address",
      "A host's IP address combined with an application port number (e.g., 10.43.3.87:23)",
      "The physical RJ-45 wall jack connected to twisted pair cabling",
      "The combination of a default gateway and DNS server IP"
    ],
    answer: 1,
    explanation: "In network programming and OSI architecture, a socket is the combination of an IP address and a port number (IP:Port), which uniquely identifies an active process on a specific host."
  },
  {
    id: 9,
    layer: 4,
    question: "Which port range is classified by IANA as 'Well-Known Ports' reserved for core server system services?",
    options: [
      "0 to 1023",
      "1024 to 49151",
      "49152 to 65535",
      "1 to 255"
    ],
    answer: 0,
    explanation: "Well-known ports span from 0 to 1023 (e.g. 21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS). Registered ports span 1024 to 49151, and dynamic/private ports span 49152 to 65535."
  },
  {
    id: 10,
    layer: 3,
    question: "Which mechanism allows multiple internal hosts with private IP addresses (e.g., 10.1.1.120) to share a single public IP address using unique port numbers?",
    options: [
      "Static NAT (SNAT)",
      "Port Address Translation (PAT / NAT Overload)",
      "APIPA autoconfiguration",
      "Subnet Masking"
    ],
    answer: 1,
    explanation: "Port Address Translation (PAT), or NAT Overload, assigns unique TCP/UDP source port numbers on the gateway's public IP address to distinguish concurrent outbound sessions from multiple local hosts."
  },
  {
    id: 11,
    layer: 3,
    question: "How should the IPv6 address '2001:0000:0B80:0000:0000:00D3:9C5A:00CC' be formatted using preferred RFC compression rules?",
    options: [
      "2001::B80::D3:9C5A:CC",
      "2001:0:B80::D3:9C5A:CC",
      "2001:0000:B80::D3:9C5A:CC",
      "2001:B80:D3:9C5A:CC"
    ],
    answer: 1,
    explanation: "Under RFC 5952: (1) Leading zeros in each 16-bit block must be suppressed (`00D3` → `D3`, `00CC` → `CC`, `0B80` → `B80`), and (2) The longest contiguous run of consecutive all-zero blocks is replaced with `::` once. The two-block run of zeros is compressed, yielding `2001:0:B80::D3:9C5A:CC`."
  },
  {
    id: 12,
    layer: 3,
    question: "What IPv6 address type always begins with the prefix 'fe80::/64'?",
    options: [
      "Global Unicast Address",
      "Link-Local Unicast Address",
      "Unique Local Address",
      "Multicast Address"
    ],
    answer: 1,
    explanation: "`fe80::/64` is the link-local unicast prefix in IPv6. Link-local addresses are mandatory on all IPv6 interfaces and operate exclusively within the local link (not routable across routers)."
  },
  {
    id: 13,
    layer: 1,
    question: "Which physical network topology connects all devices to a central switch/hub, where failure of a single cable affects only that one node?",
    options: [
      "Bus Topology",
      "Ring Topology",
      "Star Topology",
      "Mesh Topology"
    ],
    answer: 2,
    explanation: "In a Star topology, all devices radiate from a central switch. If an individual device cable breaks, only that node goes down. The single point of failure is the central switch itself."
  },
  {
    id: 14,
    layer: 3,
    question: "Which troubleshooting tool transmits ICMP Echo Request messages and waits for Echo Reply packets to verify Layer 3 connectivity?",
    options: [
      "nslookup",
      "arp",
      "ping",
      "netsh"
    ],
    answer: 2,
    explanation: "`ping` (Packet Internet Groper) uses ICMP Echo Request (Type 8) and Echo Reply (Type 0) to verify TCP/IP protocol installation, NIC binding, and end-to-end IP reachability."
  },
  {
    id: 15,
    layer: 4,
    question: "In the TCP 3-way handshake, if Client sends SYN with Seq=100, what will the Server return in its SYN-ACK response?",
    options: [
      "Seq=100, Ack=100",
      "Seq=300 (or new random ISN), Ack=101",
      "Seq=101, Ack=100",
      "Seq=0, Ack=0"
    ],
    answer: 1,
    explanation: "The server generates its own Initial Sequence Number (e.g. Seq=300) and acknowledges the client's SYN by incrementing the client's Seq by 1 (Ack = 100 + 1 = 101), because SYN consumes 1 sequence number."
  }
];
