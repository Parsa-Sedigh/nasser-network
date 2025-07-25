# 16. What Is UDP
With IP addr, we address the host. But a host can have many different apps running and we can send multiple reqs that go to different apps,
in **the same IP addr**. But with UDP, we can uniquely identify a running process that is using a certain port.

UDP doesn't guarantee delivery.

IP packets have a large 20 bytes of headers. UDP has 8 byte headers. Everything is on top of IP right? Including UDP, so now we got
28 bytes of headers. Note that these are separate layers, so they do not overlap, hence the 28 bytes.

## UDP use cases
### VPN
Use vpn with UDP not TCP. Because TCP meltdown can happen.

TCP Meltdown refers to a situation where too much TCP traffic overwhelms a network or host
leading to degraded performance or complete failure.

It usually happens when TCP’s congestion control mechanisms fail to prevent overload.

When you use a VPN that runs over TCP (like OpenVPN in TCP mode), you’re essentially tunneling TCP inside another TCP connection.
This setup can cause serious performance issues — often referred to as a form of TCP Meltdown or more accurately, TCP-over-TCP meltdown.

Some VPNs use UDP like the OpenVPN IN TCP mode, but most of the VPNs use IP directly, so they put an IP into another IP packet.
So your IP packet that you originally send(called naked IP packet), will be put in another IP packet by VPN and
encrypts the new packet and will send it.

---

### DNS
We need DNS to translate hostnames to ip addrs, since we can't send IP packets to hostnames.

NOTE: Everytime you have a mapping(like hostname to ip addr, ip addr tp mac addr), you have poisoning. So we have DNS poisoning,
ARP poisoning. DNS poisoning means: Someone intercepts the UDP datagrams and change the destination of them to somewhere else.

So DNS protocol usually uses udp. So the dns req fits inside udp datagrams.

### Multiplexing & demultiplexing
#### What Would Happen Without Multiplexing?
- **Single Application Per Device Per Protocol**: Only one application or process could use 
a communication protocol (like TCP or UDP) on a device at any given time. For example, if a web browser was using the network,
no other application (like email or file transfer) could communicate simultaneously.
- No Simultaneous Connections
    - A device could not maintain multiple connections to the same or different servers at the same time.
    - Downloading a file and browsing a website simultaneously would be impossible.
- Severe Resource Wastage: Network resources would be underutilized because only one stream of data could be sent or received at a time,
regardless of available bandwidth.
- No Application Isolation: Data arriving at a device would not be directed to the correct application. There would be no way to
distinguish which process should handle incoming data, leading to confusion and potential data loss.
- Reduced Network Functionality
    - Core internet services like web browsing, email, streaming, and gaming would not be able to coexist on the same device.
    - **Servers could only handle one client at a time**, making modern web services and cloud computing impossible.

Practical Example:

| Scenario                               | With Multiplexing                  | Without Multiplexing         |
|----------------------------------------|------------------------------------|------------------------------|
| Multiple browser tabs open             | Supported (each gets a connection) | Only one tab could work      |
| Running email and web browser together | Both can work simultaneously       | Only one can use the network |
| Server handling many clients           | Thousands of clients supported     | Only one client at a time    |

#### TCP Multiplexing vs UDP Multiplexing
> Multiplexing at the transport layer refers to combining http reqs from multiple application processes,
assigning them unique identifiers, and sending them over the network. In other words, multiplexing
allows a single TCP/UDP connection to be used for multiple in flight HTTP requests.

The identifiers:
- in tcp: TCP is a connection-oriented protocol. Each connection is identified by a unique 4-tuple:
  - source IP addr
  - Source port number
  - Destination IP addr
  - Destination port number
- in udp: connectionless protocol
  - Source port number
  - Destination port number

`Demultiplexing` is the reverse process: received data is directed to the correct application based on these identifiers

Both TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) support multiplexing, which allows multiple
applications or processes to use the network simultaneously without interfering with each other.
However, the way they achieve multiplexing and the implications for reliability, connection management and
performance differ significantly.

#### Application layer multiplexing
HTTP/2 multiplexing operates at the application layer and introduces a completely different approach for multiplexing using **binary frames and streams**:
- Binary Framing Layer:  HTTP/2 introduces a binary framing layer that breaks HTTP messages into small frames, each tagged with a stream identifier
- Stream-Based Communication: Multiple HTTP requests/responses can be sent concurrently over a **single TCP connection** using different stream IDs

So HTTP/2 allows multiple http reqs through only one tcp conn.

These two types of multiplexing complement each other:
1. Layer 4 multiplexing: handles multiple applications on the same host
2. HTTP/2(layer 7) multiplexing: to send multiple HTTP requests (HTML, CSS, JavaScript, images) simultaneously over one TCP connection

##### Solving Different Problems
Layer 4 Multiplexing Solves:
- Application Isolation: Ensures data reaches the correct application
- Concurrent Process Communication: Allows multiple network applications to run simultaneously

HTTP/2 Multiplexing Solves:
- HTTP-level Head-of-Line Blocking: At the HTTP level, one slow request doesn’t block others(but tcp-level head of line blocking is still an issue in http2)
- Connection Limitations: Eliminates the need for multiple TCP connections per domain
- Resource Efficiency: Reduces TCP connection overhead and server resource usage

While HTTP/2 multiplexing solves HTTP-level head-of-line blocking, it still suffers from TCP-level head-of-line blocking.
When a TCP packet is lost, all HTTP/2 streams on that connection must wait for retransmission, which can actually
make the problem worse than HTTP/1.1’s multiple connections approach

# 17. User Datagram Structure
Each udp packet is identified with source port + destination port. So at most, we can spin up about 65000 conns.

NOTE: It's very unlikely that a bit changed(because of voltage fluctuations or ...) and the checksum also changed in a way that
at the end, the result is still correct! So checksum helps us with integrity of packets.

# 18. UDP Pros & Cons
No ack means we don't know the thing we sent was received or not. So for DB apps we can't use UDP otherwise you'll corrupt the DB
because there's no ack and guarantee of delivery and order.

Anyone can send any UDP packets at any moment they want. That's why UDP is used in attacks a lot, like DNS flooding attack.
Since UDP is stateless, the server being attacked **has to** process every UDP packet, it doesn't know hey this source IP talked to me before.

DNS flooding: sending udp datagrams to dns servers and forging the source IP to the victim's IP. Then the dns servers will reply back
to the victim and the victim's host has to process them and it will eventually go down. So the connectionless attr of UDP could hurt.

Flow control: manages the transmission rate of data between a sender and receiver to prevent buffer overflow.
It allows the receiver to control how much data the sender can transmit before requiring an acknowledgment,
preventing the sender from overwhelming the receiver with more data than it can process.

UDP can be easily spoofed since there's no prior conn(handshake). TCP first requires a conn, we can't just send data through TCP, the
receiver will say: I don't have a conn with you, it's gonna drop it.

# 19. Sockets, Connections and Kernel Queues
One machine can have more than one IP addr. In every machine, we have multiple network interface cards(NIC). Each NIC has it's own IP addr.
In addition to multiple NICs, we can create unlimited virtual NICs.

Security warning: Do not listen to all network interfaces which is done by listening to `0.0.0.0` in IPV4 or `[::]` in IPV6.
Hackers scan the whole web looking for ip ranges + default ports for things like mongodb, elasticsearch and they will find vulnerable
hosts.

## TCP Server Connection Flow
- 🔧 Server Setup
  1. socket(): kernel creates a new TCP socket
  2. bind(): Bind socket to an IP address and port (e.g. 0.0.0.0:8080)
  3. listen(backlog)
     - Put socket in passive (listening) mode
     - Kernel creates two queues: SYN queue -> for half-open (incomplete) connections. Accept queue -> for fully established connections.
       The size of these queues(actually hash tables) are specified by the `backlog`
- 📞 Client Connects
  4. Client sends SYN packet
     - is added to SYN queue
     - server replies with SYN-ACK
  5. Client replies with ACK -> TCP 3-way handshake is complete
  6. Connection is moved from SYN queue to Accept queue
    - Now the connection is considered established
    - **But server application can't see it yet**
- 🧠 Server Application Accepts
  7. Server calls accept(), entry is removed from accept queue, accept() returns a **new** socket(connfd). Now the application gets a
     connection which is a file descriptor that lives in whichever process called accept().
     The socket represents the established TCP connection. This socket now has:
     - send queue: buffers app -> kernel -> network
     - receive queue: buffers network -> kernel -> app
  8. Server and client can now read/write data

NOTE: Client also has its own send/receive queues.

accept() creates a file descriptor of conn and copies it from the kernel space to the user's space so we can use.

NOTE: If accept() is called but the accept queue is empty, we're blocked, that's why accept() is a candidate for asynchronous IO.

NOTE: There are 4 queues per accepted conns: 1. syn 2. accept 3. send 4. receive.

NOTE: Malicious clients can send a lot of SYNs to server and server will respond back with SYN/ACK but client won't continue by sending ACK.
This is a DOS attack. This has been solved with SYN cookies.

NOTE: There are different file descriptors for listening socket and for actual accepted conns. Each new conn gets it's own file descriptor.

## Socket sharding
Used to scale acceptance of conns.

By default, only one core is actively handling incoming TCP connections — unless you explicitly design your server or 
use features like `SO_REUSEPORT` or a multi-threaded model.

Different parallelism involved for handling incoming conns:
1. Single Threaded Server: If your server runs a single accept() loop in a single thread, then:
    - It runs on one core
    - All TCP connection handling happens by one core
    - Even if your machine has 8 or 64 cores — only one core is used by the server’s main accept loop
    - This is the default behavior in many simple server implementations(especially in learning examples or old designs)
2. Multi-Threaded Server **Without Sharding**
    - All threads call accept() on the same socket
    - The kernel by default, uses a lock internally. So only one thread at a time can be woken up to handle a connection.
      Therefore, there are a lot of lock contention.
    - You get some parallelism, but still limited by lock contention. Only one thread is doing work at the same time.
3. Multi-Threaded Server with Socket Sharding (`SO_REUSEPORT`)
    - Each thread creates its own socket
    - All sockets bind to the same IP:PORT by setting `SO_REUSEPORT`
    - The kernel load balances connections across the sockets → which maps nicely to one thread per core(best utilization of CPU cores is one thread per core)

# 20. UDP Server with Javascript using NodeJS
```shell
# netcat
# -u makes it udp
nc -u 127.0.0.1 5500
```

# 21. UDP Server with C

# 22. Capturing UDP traffic with TCPDUMP
Let's capture UDP packets with tcpdump!

The most popular UDP protocol is DNS.

```shell
# since we're using google's DNS server to find the IP addr of domains, we filter on the IP of google's DNS server
# which is 8.8.8.8 whether it was a packet that we sent or we received
tcpdump -n -v -i en0 src 8.8.8.8 or dst 8.8.8.8
```

Now in another terminal window, do dns query using nslookup
```shell
# nslookup <what domain you wanna get it's IP?> <what dns resolver you wanna use for this?>
nslookup husseinnasser.com 8.8.8.8
```

This tcpdump log captures a sequence of four network packets related to DNS queries and responses for resolving the domain 
husseinnasser.com:

> 10:19:33.316051 IP (tos 0x0, ttl 64, id 30377, offset 0, flags [none], proto UDP (17), length 63)
    192.168.1.105.57772 > 8.8.8.8.53: 58479+ A? husseinnasser.com. (35)
> 
> 10:19:33.671284 IP (tos 0x0, ttl 113, id 32293, offset 0, flags [none], proto UDP (17), length 127)
    8.8.8.8.53 > 192.168.1.105.57772: 58479 4/0/0 husseinnasser.com. A 216.239.38.21, husseinnasser.com. A 216.239.36.21, husseinnasser.com. A 216.239.32.21, husseinnasser.com. A 216.239.34.21 (99)
> 
> 10:19:33.673450 IP (tos 0x0, ttl 64, id 48830, offset 0, flags [none], proto UDP (17), length 63)
    192.168.1.105.50824 > 8.8.8.8.53: 57091+ AAAA? husseinnasser.com. (35)
> 
> 10:19:34.040911 IP (tos 0x80, ttl 114, id 61744, offset 0, flags [none], proto UDP (17), length 123)
    8.8.8.8.53 > 192.168.1.105.50824: 57091 0/1/0 (95)

There are 4 packets in the flow and are explained below:

Packet-by-Packet Explanation:
### Packet 1: DNS Query for A Record
- Timestamp: 10:19:33.316051 – Packet captured at 10:19:33 AM.
- IP Headers: IPv4, Type of Service (ToS) 0 so default, no special priority, TTL 64 (local network) - this is standard for local networks, ID 30377, no fragmentation, UDP protocol, 63 bytes.
- Source/Destination: Local device 192.168.1.105 on ephemeral port 57772 queries Google’s DNS server 8.8.8.8 on port 53 (DNS).
- DNS Payload: Query ID 58479, recursion desired (+), type A (IPv4 address) for husseinnasser.com, payload 35 bytes.
- Summary: The local device initiates a DNS query to resolve the IPv4 address of husseinnasser.com.

### Packet 2: DNS Response for A Record
- Timestamp: 10:19:33.671284 – Response received ~355ms later.
- IP Headers: IPv4, ToS 0, TTL 113 (reduced from Google’s network), ID 32293, UDP, 127 bytes.
- Source/Destination: Google’s DNS server 8.8.8.8 responds to 192.168.1.105 on port 57772.
- DNS Payload: Query ID 58479 (matches query), 4 answers, 0 authority records, 0 additional records. 
Returns four A records for husseinnasser.com: 216.239.38.21, 216.239.36.21, 216.239.32.21, 216.239.34.21. Payload 99 bytes.
- Summary: Google’s DNS server responds with four IPv4 addresses for husseinnasser.com, completing the A record query.

NOTE:
- `proto UDP (17)` – So uses UDP protocol (common for DNS). So **UDP protocol number is 17**.
- At 192.168.1.105.57772 , the 57772 part is the port. UDP and TCP are layer 4 so they know the concept of ports. 
- In this example, 57772 is the source port. Why do we need the source port? Because we need a way for the receiver to reply back to us and
if it just replied without specifying the port, we won't know which app this packet is.

Q: Why we need dns query id (like 58479+)?

A: Since UDP is stateless, we need a tag or unique identifier that the sender sets and sends in the UDP packets. Now when the 
receiver replies back, they give us this number again. So know the response belongs to that query. 
Why not just use the `<source IP>:<source port>` combination as the query id? You can but not reliable in a NAT environment.

### Packet 3: DNS Query for AAAA Record
- Timestamp: 10:19:33.673450 – Sent ~2ms after the A response.
- IP Headers: IPv4, ToS 0, TTL 64, ID 48830, UDP, 63 bytes.
- Source/Destination: 192.168.1.105 on port 50824 queries 8.8.8.8 on port 53.
- DNS Payload: Query ID 57091, recursion desired, type AAAA (IPv6 address) for husseinnasser.com, payload 35 bytes.
- Summary: The local device queries the IPv6 address of husseinnasser.com.

### Packet 4: DNS Response for AAAA Record
- Timestamp: 10:19:34.040911 – Response received ~367ms later.
- IP Headers: IPv4, ToS 0x80 (possibly prioritized), TTL 114, ID 61744, UDP, 123 bytes.
- Source/Destination: 8.8.8.8 responds to 192.168.1.105 on port 50824.
- DNS Payload: Query ID 57091, 0 answers, 1 authority record, 0 additional records, payload 95 bytes. Indicates no AAAA records exist for husseinnasser.com.
- Summary: Google’s DNS server responds that husseinnasser.com has no IPv6 addresses, with an authority record (likely a SOA or NS record).

### Overall Interaction
1. The local device (192.168.1.105) sends an A query for husseinnasser.com to Google’s DNS server (8.8.8.8).
2. The server responds with four IPv4 addresses. 
3. The device immediately sends an AAAA query to check for IPv6 addresses. 
4. The server responds that no IPv6 addresses exist.