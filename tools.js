/**
 * OSI Interactive Suite - Tools & CLI Simulator
 * Subnet Calculator, IPv6 EUI-64 Engine, Port/Socket Inspector, and Terminal Simulator
 */

class NetworkTools {
  static ipToInt(ip) {
    return ip.split(".").reduce((acc, oct) => ((acc << 8) + parseInt(oct, 10)) >>> 0, 0);
  }

  static intToIp(int) {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join(".");
  }

  static calculateSubnet(ipStr, cidr) {
    const parts = ipStr.trim().split(".");
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return { error: "Invalid IPv4 address format (e.g. 192.168.1.100)" };
    }
    const prefix = parseInt(cidr, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return { error: "CIDR prefix must be between 0 and 32" };
    }

    const ipInt = this.ipToInt(ipStr);
    const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const wildcardInt = ~maskInt >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const totalAddresses = Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);

    const firstHostInt = prefix >= 31 ? networkInt : (networkInt + 1) >>> 0;
    const lastHostInt = prefix >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0;

    // Determine Class
    const firstOctet = parseInt(parts[0], 10);
    let ipClass = "Class A";
    let defaultMask = "/8 (255.0.0.0)";
    if (firstOctet >= 128 && firstOctet <= 191) {
      ipClass = "Class B";
      defaultMask = "/16 (255.255.0.0)";
    } else if (firstOctet >= 192 && firstOctet <= 223) {
      ipClass = "Class C";
      defaultMask = "/24 (255.255.255.0)";
    } else if (firstOctet >= 224 && firstOctet <= 239) {
      ipClass = "Class D (Multicast)";
      defaultMask = "N/A";
    } else if (firstOctet >= 240) {
      ipClass = "Class E (Experimental/Research)";
      defaultMask = "N/A";
    }

    // Determine Scope
    let scope = "Public Internet Routable";
    if (firstOctet === 10) scope = "RFC 1918 Private (Class A)";
    else if (firstOctet === 172 && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) scope = "RFC 1918 Private (Class B)";
    else if (firstOctet === 192 && parseInt(parts[1], 10) === 168) scope = "RFC 1918 Private (Class C)";
    else if (firstOctet === 127) scope = "Loopback (Internal Host)";
    else if (firstOctet === 169 && parseInt(parts[1], 10) === 254) scope = "APIPA (DHCP Autoconfiguration Failure)";

    return {
      ip: ipStr,
      cidr: `/${prefix}`,
      subnetMask: this.intToIp(maskInt),
      wildcardMask: this.intToIp(wildcardInt),
      networkId: this.intToIp(networkInt),
      broadcastAddress: this.intToIp(broadcastInt),
      usableRange: usableHosts > 0 ? `${this.intToIp(firstHostInt)} – ${this.intToIp(lastHostInt)}` : "None (Point-to-point/Host)",
      totalAddresses: totalAddresses.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
      ipClass: ipClass,
      defaultMask: defaultMask,
      scope: scope
    };
  }

  static generateEui64(macStr) {
    const clean = macStr.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
    if (clean.length !== 12) {
      return { error: "Please enter a valid 48-bit MAC address (12 hex digits, e.g. 00:1A:2B:3C:4D:5E)" };
    }

    const byte0 = parseInt(clean.slice(0, 2), 16);
    // Invert the 7th bit (Universal/Local bit, 0x02)
    const modifiedByte0 = (byte0 ^ 0x02).toString(16).padStart(2, "0");

    const p1 = modifiedByte0 + clean.slice(2, 4);
    const p2 = clean.slice(4, 6) + "ff";
    const p3 = "fe" + clean.slice(6, 8);
    const p4 = clean.slice(8, 12);

    const fullInterfaceId = `${p1}:${p2}:${p3}:${p4}`;
    const fullLinkLocal = `fe80:0000:0000:0000:${fullInterfaceId}`;
    const compressedLinkLocal = `fe80::${p1}:${p2}:${p3}:${p4}`.replace(/:0{1,3}/g, ":");

    return {
      mac: macStr,
      step1Insert: `${clean.slice(0, 6).match(/../g).join(":")}:ff:fe:${clean.slice(6, 12).match(/../g).join(":")}`,
      step2InvertBit7: `Byte 0: 0x${clean.slice(0, 2)} (${byte0.toString(2).padStart(8, "0")}) → Invert bit 7 → 0x${modifiedByte0} (${(byte0 ^ 0x02).toString(2).padStart(8, "0")})`,
      interfaceId: fullInterfaceId,
      fullLinkLocal: fullLinkLocal,
      compressedLinkLocal: compressedLinkLocal
    };
  }

  static compressIpv6(ipv6Str) {
    let clean = ipv6Str.trim().toLowerCase();
    // Expand if already compressed
    if (clean.includes("::")) {
      const parts = clean.split("::");
      const left = parts[0] ? parts[0].split(":") : [];
      const right = parts[1] ? parts[1].split(":") : [];
      const missing = 8 - (left.length + right.length);
      const middle = Array(missing).fill("0000");
      clean = [...left, ...middle, ...right].map(b => b.padStart(4, "0")).join(":");
    } else {
      clean = clean.split(":").map(b => b.padStart(4, "0")).join(":");
    }

    // Strip leading zeros
    const stripped = clean.split(":").map(b => b.replace(/^0+/, "") || "0");

    // Find longest contiguous run of zeros
    let bestStart = -1, bestLen = 0;
    let curStart = -1, curLen = 0;
    for (let i = 0; i < 8; i++) {
      if (stripped[i] === "0") {
        if (curStart === -1) curStart = i;
        curLen++;
        if (curLen > bestLen) {
          bestStart = curStart;
          bestLen = curLen;
        }
      } else {
        curStart = -1;
        curLen = 0;
      }
    }

    let compressed = "";
    if (bestLen > 1) {
      const before = stripped.slice(0, bestStart).join(":");
      const after = stripped.slice(bestStart + bestLen).join(":");
      compressed = `${before}::${after}`;
      if (compressed.startsWith("::") && !compressed.startsWith(":::")) {
        // already fine
      }
    } else {
      compressed = stripped.join(":");
    }

    return {
      expanded: clean,
      leadingZerosRemoved: stripped.join(":"),
      compressed: compressed
    };
  }
}

class TerminalSimulator {
  constructor(containerId, inputId) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.history = [];
    this.historyIdx = 0;
  }

  init() {
    if (!this.input || !this.container) return;

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.history.push(cmd);
          this.historyIdx = this.history.length;
          this.execute(cmd);
          this.input.value = "";
        }
      } else if (e.key === "ArrowUp") {
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.history[this.historyIdx] || "";
        }
      } else if (e.key === "ArrowDown") {
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.input.value = this.history[this.historyIdx] || "";
        } else {
          this.historyIdx = this.history.length;
          this.input.value = "";
        }
      }
    });

    this.printBanner();
  }

  printBanner() {
    this.appendOutput(`
<span class="text-emerald-400 font-bold">CSCI 250 Interactive Network Terminal [Dual-Mode Linux / Windows]</span>
<span class="text-slate-400">Type <span class="text-amber-400 font-bold">help</span> to view available diagnostic commands (ping, ifconfig, ip a, ipconfig, nslookup, dig, arp, ss, etc.).</span>
    `);
  }

  appendOutput(html) {
    const div = document.createElement("div");
    div.className = "mb-2 font-mono text-xs leading-relaxed";
    div.innerHTML = html;
    this.container.appendChild(div);
    this.container.scrollTop = this.container.scrollHeight;
  }

  execute(rawCmd) {
    this.appendOutput(`<div class="text-slate-400 font-mono text-xs mt-2"><span class="text-sky-400 font-bold">student@csci250-lab:~$</span> <span class="text-white">${this.escapeHtml(rawCmd)}</span></div>`);

    const parts = rawCmd.trim().split(/\s+/);
    const bin = parts[0].toLowerCase();
    const arg = parts[1] || "";

    switch (bin) {
      case "help":
        this.appendOutput(`
<span class="text-amber-300 font-bold">Available Commands:</span>
  <span class="text-emerald-400">ping &lt;target&gt;</span>        - Sends ICMP Echo Requests (tests L3 IP reachability)
  <span class="text-emerald-400">ifconfig</span>             - Displays Linux interface configurations & MAC addresses
  <span class="text-emerald-400">ip a</span> / <span class="text-emerald-400">ip addr</span>        - Modern Linux interface, IP, and link state tool
  <span class="text-emerald-400">ipconfig [/all]</span>     - Windows TCP/IP configuration, DHCP lease, and DNS
  <span class="text-emerald-400">nslookup &lt;domain&gt;</span>    - Resolves FQDN to IP using configured DNS server
  <span class="text-emerald-400">dig &lt;domain&gt;</span>         - Linux DNS diagnostic tool with query trace
  <span class="text-emerald-400">arp -a</span>               - Displays Layer 2 to Layer 3 address resolution table
  <span class="text-emerald-400">netstat -tuln</span> / <span class="text-emerald-400">ss</span>   - Lists active listening TCP/UDP sockets and ports
  <span class="text-emerald-400">traceroute &lt;target&gt;</span>   - Traces hop-by-hop L3 path using TTL expiration
  <span class="text-emerald-400">clear</span>                - Clears terminal output
        `);
        break;

      case "clear":
        this.container.innerHTML = "";
        this.printBanner();
        break;

      case "ping":
        const target = arg || "google.com";
        const targetIp = target === "127.0.0.1" ? "127.0.0.1" : (target === "gateway" ? "192.168.1.1" : "142.250.190.46");
        this.appendOutput(`
PING ${this.escapeHtml(target)} (${targetIp}) 56(84) bytes of data.
64 bytes from ${targetIp}: icmp_seq=1 ttl=117 time=14.2 ms
64 bytes from ${targetIp}: icmp_seq=2 ttl=117 time=13.8 ms
64 bytes from ${targetIp}: icmp_seq=3 ttl=117 time=14.1 ms
64 bytes from ${targetIp}: icmp_seq=4 ttl=117 time=13.9 ms

--- ${this.escapeHtml(target)} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.842/14.015/14.231/0.145 ms
<span class="text-slate-400">[Protocol: ICMP Type 8 (Echo Request) / Type 0 (Echo Reply). Verified L3 binding & reachability.]</span>
        `);
        break;

      case "ifconfig":
        this.appendOutput(`
<span class="text-sky-300 font-bold">eth0:</span> flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::3c52:82ff:fe11:2233  prefixlen 64  scopeid 0x20&lt;link&gt;
        ether 3c:52:82:11:22:33  txqueuelen 1000  (Ethernet)
        RX packets 45892  bytes 58192301 (55.4 MiB)
        TX packets 29104  bytes 12904812 (12.3 MiB)

<span class="text-sky-300 font-bold">lo:</span> flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10&lt;host&gt;
        loop  txqueuelen 1000  (Local Loopback)
        `);
        break;

      case "ip":
        if (arg === "a" || arg === "addr" || arg === "address" || !arg) {
          this.appendOutput(`
1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp3s0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 3c:52:82:11:22:33 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.105/24 brd 192.168.1.255 scope global dynamic noprefixroute enp3s0
       valid_lft 86320sec preferred_lft 86320sec
    inet6 fe80::3c52:82ff:fe11:2233/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
          `);
        } else {
          this.appendOutput(`<span class="text-red-400">Usage: ip a (or ip addr)</span>`);
        }
        break;

      case "ipconfig":
        const isAll = (parts[1] || "").toLowerCase() === "/all";
        this.appendOutput(`
Windows IP Configuration

   Host Name . . . . . . . . . . . . : LAB-WORKSTATION-01
   Primary Dns Suffix  . . . . . . . : campus.bridgewater.edu
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No

Ethernet adapter Ethernet 1:

   Connection-specific DNS Suffix  . : campus.bridgewater.edu
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection (7) I219-V
   Physical Address. . . . . . . . . : 3C-52-82-11-22-33
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Link-local IPv6 Address . . . . . : fe80::3c52:82ff:fe11:2233%12(Preferred)
   IPv4 Address. . . . . . . . . . . : 192.168.1.105(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Monday, September 28, 2026 8:00:15 AM
   Lease Expires . . . . . . . . . . : Tuesday, September 29, 2026 8:00:15 AM
   Default Gateway . . . . . . . . . : 192.168.1.1
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.1, 1.1.1.1, 8.8.8.8
        `);
        break;

      case "nslookup":
        const host = arg || "google.com";
        this.appendOutput(`
Server:         192.168.1.1
Address:        192.168.1.1#53

Non-authoritative answer:
Name:   ${this.escapeHtml(host)}
Address: 142.250.190.46
Name:   ${this.escapeHtml(host)}
Address: 2607:f8b0:4004:800::200e
<span class="text-slate-400">[Resolved via recursive DNS lookup across Root → TLD (.com) → Authoritative server]</span>
        `);
        break;

      case "dig":
        const dHost = arg || "google.com";
        this.appendOutput(`
; &lt;&lt;&gt;&gt; DiG 9.18.28 &lt;&lt;&gt;&gt; ${this.escapeHtml(dHost)}
;; global options: +cmd
;; Got answer:
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: NOERROR, id: 48921
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;${this.escapeHtml(dHost)}.                   IN      A

;; ANSWER SECTION:
${this.escapeHtml(dHost)}.            245     IN      A       142.250.190.46

;; Query time: 14 msec
;; SERVER: 192.168.1.1#53(192.168.1.1) (UDP)
;; WHEN: Mon Sep 28 11:30:00 EDT 2026
;; MSG SIZE  rcvd: 55
        `);
        break;

      case "arp":
        this.appendOutput(`
Address                  HWtype  HWaddress           Flags Mask            Iface
192.168.1.1              ether   00:1a:2b:3c:4d:5e   C                     eth0
192.168.1.120            ether   b8:27:eb:aa:bb:cc   C                     eth0
192.168.1.200            ether   e4:5f:01:99:88:77   C                     eth0
<span class="text-slate-400">[Layer 2 to Layer 3 CAM resolution: Maps Destination IP to Hardware MAC address]</span>
        `);
        break;

      case "netstat":
      case "ss":
        this.appendOutput(`
State      Recv-Q Send-Q Local Address:Port        Peer Address:Port
LISTEN     0      128    0.0.0.0:22               0.0.0.0:*          (SSH)
LISTEN     0      511    0.0.0.0:80               0.0.0.0:*          (HTTP)
LISTEN     0      511    0.0.0.0:443              0.0.0.0:*          (HTTPS)
LISTEN     0      128    127.0.0.1:53             0.0.0.0:*          (DNS Resolver)
LISTEN     0      50     0.0.0.0:3389             0.0.0.0:*          (RDP)
<span class="text-slate-400">[Socket composition: IP_Address:Port_Number bound to transport listener]</span>
        `);
        break;

      case "route":
        this.appendOutput(`
<span class="text-sky-300 font-bold">Kernel IP routing table (Linux):</span>
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0
127.0.0.0       0.0.0.0         255.0.0.0       U     0      0        0 lo
<span class="text-slate-400">[Default route: 0.0.0.0/0 points to Next Hop Gateway 192.168.1.1 out interface eth0]</span>
        `);
        break;

      case "pathping":
        const ppTarget = arg || "google.com";
        this.appendOutput(`
Tracing route to ${this.escapeHtml(ppTarget)} [142.250.190.46] over a maximum of 30 hops:
  0  LAB-WORKSTATION-01 [192.168.1.105] 
  1  192.168.1.1 
  2  10.240.0.1 
  3  96.120.10.45 
  4  142.250.190.46 

Computing statistics for 100 seconds...
            Source to Here   This Node/Link
Hop  RTT    Lost/Sent = Pct  Lost/Sent = Pct  Address
  0                                           LAB-WORKSTATION-01 [192.168.1.105]
                                0/ 100 =  0%   |
  1    0ms     0/ 100 =  0%     0/ 100 =  0%  192.168.1.1
                                0/ 100 =  0%   |
  2    5ms     0/ 100 =  0%     0/ 100 =  0%  10.240.0.1
                                0/ 100 =  0%   |
  3   11ms     0/ 100 =  0%     0/ 100 =  0%  96.120.10.45
<span class="text-slate-400">[Pathping combines ping and tracert to isolate per-hop packet loss and latency]</span>
        `);
        break;

      case "tcpdump":
        this.appendOutput(`
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
11:32:01.102341 IP 192.168.1.105.52144 > 142.250.190.46.80: Flags [S], seq 1000, win 64240, options [mss 1460,sackOK], length 0
11:32:01.115829 IP 142.250.190.46.80 > 192.168.1.105.52144: Flags [S.], seq 5000, ack 1001, win 65535, options [mss 1430], length 0
11:32:01.115910 IP 192.168.1.105.52144 > 142.250.190.46.80: Flags [.], ack 5001, win 64240, length 0
11:32:01.116240 IP 192.168.1.105.52144 > 142.250.190.46.80: Flags [P.], seq 1001:1025, ack 5001, win 64240: HTTP: GET /index.html HTTP/1.1
11:32:01.129480 IP 142.250.190.46.80 > 192.168.1.105.52144: Flags [.], ack 1025, win 65511, length 0
5 packets captured, 5 packets received by filter, 0 packets dropped by kernel
<span class="text-slate-400">[Packet sniffer captured live Layer 2-4 handshakes and payloads crossing the interface]</span>
        `);
        break;

      case "traceroute":
      case "tracert":
        const trHost = arg || "1.1.1.1";
        this.appendOutput(`
traceroute to ${this.escapeHtml(trHost)} (${trHost}), 30 hops max, 60 byte packets
 1  192.168.1.1 (192.168.1.1)  0.892 ms  0.741 ms  0.690 ms
 2  10.240.0.1 (10.240.0.1)  6.120 ms  5.980 ms  6.012 ms
 3  96.120.10.45 (96.120.10.45)  11.230 ms  10.984 ms  11.450 ms
 4  one.one.one.one (1.1.1.1)  13.412 ms  13.120 ms  13.088 ms
<span class="text-slate-400">[Path discovery mechanism: Sends packets starting at TTL=1, incrementing by 1. Each router decrements TTL to 0 and returns ICMP Type 11 (Time Exceeded).]</span>
        `);
        break;

      default:
        this.appendOutput(`<span class="text-red-400">Command not recognized: '${this.escapeHtml(bin)}'. Type <span class="text-amber-300 font-bold">help</span> for available commands.</span>`);
        break;
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
