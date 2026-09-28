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
  },
  {
    id: 16,
    layer: 3,
    question: "What primary advantage does OSPF (Open Shortest Path First) offer over RIP (Routing Information Protocol)?",
    options: [
      "OSPF is distance-vector and uses hop count exclusively",
      "OSPF is a link-state protocol with no hop limit, fast convergence, and path calculations based on bandwidth cost",
      "OSPF operates at Layer 2, bypassing IP routing entirely",
      "OSPF is proprietary to Cisco hardware only"
    ],
    answer: 1,
    explanation: "RIP is a distance-vector protocol limited to 15 hops with slow periodic updates. OSPF is an open standard link-state protocol using Dijkstra's SPF algorithm, imposing no hop limits, maintaining link-state databases, and providing rapid convergence with low overhead."
  },
  {
    id: 17,
    layer: 3,
    question: "Why are Multilayer (Layer 3) Switches typically faster and less expensive than traditional software routers for internal LAN routing?",
    options: [
      "Layer 3 switches do not inspect IP addresses",
      "Layer 3 switches perform packet forwarding in dedicated hardware Application-Specific Integrated Circuits (ASICs)",
      "Layer 3 switches eliminate the need for IP subnet masks",
      "Layer 3 switches use Token Ring protocols"
    ],
    answer: 1,
    explanation: "Layer 3 switches perform hardware-based packet switching using specialized ASICs, which forward packets at wire speed. Traditional routers perform routing lookups in software/general-purpose CPUs, though routers support wider WAN interface varieties."
  },
  {
    id: 18,
    layer: 3,
    question: "Which routing protocol is classified as an Exterior Gateway Protocol (EGP) and is known as the 'Protocol of the Internet'?",
    options: [
      "EIGRP",
      "OSPF",
      "BGP (Border Gateway Protocol)",
      "IS-IS"
    ],
    answer: 2,
    explanation: "BGP is the only current Exterior Gateway Protocol (EGP). It uses a path-vector algorithm to route packets across separate Autonomous Systems (AS) spanning ISPs and global backbones."
  },
  {
    id: 19,
    layer: 3,
    question: "What is the primary function of ICMP (Internet Control Message Protocol) on an IP network?",
    options: [
      "It retransmits lost data packets automatically",
      "It reports on the success or failure of data delivery (e.g., Destination Unreachable, TTL Exceeded) but does not correct errors",
      "It assigns dynamic IP addresses to clients",
      "It encrypts application payloads using SSL/TLS"
    ],
    answer: 1,
    explanation: "ICMP reports network transmission failures and operational telemetry (such as Echo Request/Reply for ping, Time Exceeded for traceroute, and Destination Unreachable). It notifies senders of errors but does not perform error recovery."
  },
  {
    id: 20,
    layer: 3,
    question: "On IPv6 networks, which protocol replaces both ARP and broadcast functions to automatically discover neighboring nodes?",
    options: [
      "APIPA",
      "NDP (Neighbor Discovery Protocol)",
      "DHCPv4",
      "NAT-PT"
    ],
    answer: 1,
    explanation: "IPv6 completely eliminates broadcast addressing and ARP. Neighbor discovery, address resolution, and router advertisements are handled by NDP (Neighbor Discovery Protocol) running over ICMPv6 multicast."
  },
  {
    id: 21,
    layer: 5,
    question: "At Layer 5 (Session Layer), what is the operational difference between half-duplex and full-duplex communication dialogues?",
    options: [
      "Half-duplex uses optical fiber, while full-duplex uses copper cabling",
      "In half-duplex, both parties can transmit but only one direction at a time; in full-duplex, both parties can transmit and receive simultaneously",
      "Half-duplex requires 64-bit encryption, while full-duplex is unencrypted",
      "Half-duplex is connectionless, while full-duplex is connection-oriented"
    ],
    answer: 1,
    explanation: "Half-duplex allows bidirectional transmission but only sequentially (parties take turns, often coordinated by software tokens or carrier sense). Full-duplex allows simultaneous bidirectional transmission over dedicated separate channels."
  },
  {
    id: 22,
    layer: 5,
    question: "In OSI Layer 5 session management, what role do Major and Minor Synchronization Points (checkpoints) serve during large file transfers or database transactions?",
    options: [
      "They encrypt the data packets to prevent eavesdropping",
      "They compress the payload into gzip format",
      "They allow the transfer to recover and resume from the last established checkpoint after a network disruption rather than restarting from the beginning",
      "They convert host byte order into network byte order"
    ],
    answer: 2,
    explanation: "Session layer checkpoints divide a long dialogue into verifiable sections. If a crash or line disconnect occurs, endpoints can roll back and retransmit only from the most recent checkpoint instead of starting the entire transfer over."
  },
  {
    id: 23,
    layer: 6,
    question: "Which OSI layer is responsible for translating between Abstract Syntax (internal data structures like C structs or JSON models) and Transfer Syntax (wire-level byte encodings like ASN.1 BER/DER or Protocol Buffers)?",
    options: [
      "Layer 4 (Transport Layer)",
      "Layer 5 (Session Layer)",
      "Layer 6 (Presentation Layer)",
      "Layer 7 (Application Layer)"
    ],
    answer: 2,
    explanation: "Layer 6 (Presentation Layer) standardizes data syntax and representation. It negotiates the Transfer Syntax (e.g., ASN.1 DER, canonical XDR, protobuf bytes) used across the wire to decouple heterogeneous operating systems and architectures from differing internal memory layouts."
  },
  {
    id: 24,
    layer: 6,
    question: "Standard Network Byte Order for multi-byte binary fields (such as TCP/UDP port numbers and IPv4 addresses) is strictly defined as which endianness?",
    options: [
      "Little-Endian (Least Significant Byte first)",
      "Big-Endian (Most Significant Byte first)",
      "Middle-Endian (Mixed Byte ordering)",
      "Dynamic-Endian (Negotiated per packet in the IP header)"
    ],
    answer: 1,
    explanation: "RFC 1700 mandates Big-Endian as Network Byte Order (the most significant byte is transmitted and stored at the lowest memory address first). x86_64 host systems are Little-Endian, requiring conversion via standard C library functions htons(), htonl(), ntohs(), and ntohl()."
  },
  {
    id: 25,
    layer: 6,
    question: "In the TLS 1.3 architecture, which component functions as the Presentation envelope responsible for encapsulating, encrypting, and tagging application data with an Authenticated Encryption with Associated Data (AEAD) cipher?",
    options: [
      "TLS Handshake Protocol",
      "TLS Record Layer",
      "TCP Sliding Window",
      "IPsec AH Header"
    ],
    answer: 1,
    explanation: "The TLS Record Layer acts at Layer 6 to fragment, encrypt, and authenticate application data using AEAD algorithms (e.g. AES-GCM or ChaCha20-Poly1305), prepending a 5-byte plaintext record header and appending an authentication tag."
  },
  {
    id: 26,
    layer: 7,
    question: "How does HTTP/2 solve the Head-of-Line (HoL) blocking problem present in HTTP/1.1 pipelining?",
    options: [
      "By switching from TCP to UDP as its underlying transport",
      "By introducing binary framing with multiplexed streams, allowing interleaved concurrent requests and responses over a single TCP connection",
      "By restricting HTTP requests to a maximum of 1460 bytes",
      "By caching all assets on the client's local hard drive"
    ],
    answer: 1,
    explanation: "HTTP/1.1 forced requests on a connection to complete sequentially in strict FIFO order. HTTP/2 introduces a binary framing layer that breaks messages into discrete frames tagged with Stream IDs, interleaving multiple bidirectional streams over a single shared TCP socket without blocking."
  },
  {
    id: 27,
    layer: 7,
    question: "Why did HTTP/3 replace TCP with the QUIC protocol running on top of UDP at the transport layer?",
    options: [
      "Because UDP does not require any operating system drivers",
      "To eliminate TCP-level Head-of-Line blocking (where one lost packet stalls all streams) and achieve 0-RTT connection resumption with integrated TLS 1.3 encryption",
      "Because TCP sequence numbers were limited to 8 bits",
      "To allow unencrypted transmission across public Wi-Fi hotspots"
    ],
    answer: 1,
    explanation: "In HTTP/2 over TCP, if a single TCP packet is dropped, the TCP receiver stalls ALL multiplexed streams until that segment is retransmitted. QUIC runs over UDP and manages independent stream loss recovery, so packet loss on one stream does not pause any other stream."
  },
  {
    id: 28,
    layer: 7,
    question: "When a recursive DNS resolver queries nameservers to resolve 'mail.example.com', what is the correct hierarchical order of query delegations?",
    options: [
      "Local Host Cache → Authoritative Nameserver → TLD Nameserver → Root Nameserver",
      "Root Nameserver ('.') → Top-Level Domain (TLD) Nameserver ('.com') → Authoritative Nameserver ('example.com')",
      "DHCP Server → Gateway Router → ISP Proxy → ICANN Web Server",
      "WINS Server → NetBIOS Master Browser → Root Server"
    ],
    answer: 1,
    explanation: "Iterative DNS resolution starts at the 13 Root nameserver clusters ('.'), which delegate to the TLD servers responsible for the domain extension ('.com'), which in turn delegate to the domain's Authoritative Nameservers holding the actual A/AAAA record."
  },
  {
    id: 29,
    layer: 7,
    question: "What are the four sequential messages exchanged between a client and a DHCP server during initial IP address leasing (the DORA process)?",
    options: [
      "Detect, Open, Receive, Authorize",
      "Discover, Offer, Request, Acknowledge",
      "Dial, Operate, Route, Authenticate",
      "Download, Organize, Resolve, Allocate"
    ],
    answer: 1,
    explanation: "DHCP uses the DORA process over UDP ports 67 (server) and 68 (client): 1. Discover (client broadcast), 2. Offer (server unicast/broadcast), 3. Request (client formal request broadcast), 4. Acknowledge (server ACK with lease parameters)."
  },
  {
    id: 30,
    layer: 7,
    question: "In Internet email architecture, which protocol is used by Mail Transfer Agents (MTAs) to push mail between servers, and which protocol is used by end-user Mail User Agents (MUAs) to pull and synchronize multiple server folders?",
    options: [
      "Push: POP3; Pull: SMTP",
      "Push: SMTP; Pull: IMAP",
      "Push: HTTP; Pull: FTP",
      "Push: SNMP; Pull: ICMP"
    ],
    answer: 1,
    explanation: "SMTP (Simple Mail Transfer Protocol, TCP 25/587) is a push protocol used by clients to submit outgoing mail and between MTAs to relay messages. IMAP (Internet Message Access Protocol, TCP 143/993) is a pull protocol allowing clients to manage and synchronize folders directly on the mail server."
  }
];

