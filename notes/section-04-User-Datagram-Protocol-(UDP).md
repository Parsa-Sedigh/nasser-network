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

Demultiplexing is the reverse process: received data is directed to the correct application based on these identifiers

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

# 18. UDP Pros & Cons

# 19. Sockets, Connections and Kernel Queues