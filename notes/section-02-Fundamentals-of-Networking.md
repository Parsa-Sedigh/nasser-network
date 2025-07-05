## 5. Client - Server Architecture
We can put the expensive workload on the stronger machine and let another machine call that strong machine.

## 6. OSI model
### Why do we need a communication model?
A protocol or standard is needed so that we know how to chop off the bits to make sense of it.

- So when we have a standard, it's gonna be used globally. Otherwise, without any standards, we have to satisfy different protocols
that exist out there, so we have to make our app impl or satisfy different protocols(that are not global) which is not good.
The app sees that: Oh I'm taking on fiber, I should convert the bits differently than what I do in light signals and ... . 
- Without a standard model, you will have equipments that each works with different models, so they won't work with each other at all.
But with a standard model, since equipments are decoupled

### What is the OSI model?
HTTP is a stateless protocol while TCP is a stateful protocol because you store a state on the server and a state on the client and
you effectively manage a session.

What the thing we send in each layer, is called?
- layer 4: tcp -> segments, udp: datagrams
- layer 3: packets
- layer 2: frames

- ethernet uses Electric signals
- fiber uses light
- wifi or lte use radio waves

Transport layer understands the concept of ports.

In physical layer, the bits are converted into appropriate physical things. For example, in case of wifi, bits are converted into
radio signals and ... .

Note: The beauty of physical layer is: the sender can send a radio signal(wifi or lte) but the receiver could be on fiber(light).

We don't need to always go through all the OSI layers. For example, when sender wants to establish a TCP conn, the flow starts
at sender's application layer, goes downward there, but it goes up until the receiver's session layer(not anymore upwards).
After the conn is established, the sender starts sending the data.

- SPORT = source port
- DPORT = destination port
- SIP: Source IP address

In the slides, the whole `SPORT, purple, DPORT` is shoved into that green space at it's bottom. So it's **not** that only the purple
part is shoved.

NOTE: The whole IP packet **must** fit into one frame, unless we fragment.

NOTE: Sometimes the packet is invalid like when there's no TCP conn and sender just sends data. The flow will terminate at session layer of
the receiver. That's why UDP doesn't really have a concept of session layer. Meaning UDP is stateless but TCP is stateful. 
With UDP the sender just sends data to receiver without any prev conn already established.

---

After establishing a conn:

In Sender:

1. You go to application,
2. then presentation,
3. then session,
4. then in transport, we convert it into the `source port + content + destination port`.
5. in network layer, it's shoved into an IP packet in this format: `source ip addr + all prev stuff + destination ip addr`.
6. data link layer: the whole IP packet is shoved into a frame(it must fit into one frame) in this format: `source mac addr + prev stuff + destination mac addr`.
7. physical layer: it's converted into physical radio waves or ...

In receiver: 

1. physical layer: Get the signals
2. data link: convert signals into bits. It knows where the frames start and end. We get source `source mac addr + data + destination mac addr`.
3. network: Unpack the **data partition** of the frame and then that data becomes the IP packet. We get: source IP addr + data + destination IP addr.
Check DIP is actually the IP of cur machine. 
4. transport: Unpack the data segment -> It gives us: `source port + data + destination port`. Now we know which port this packet
belongs to, because we have the destination port. Note that there are thousands of ports on a machine. Note: In most cases, one
port is used by one process.
5. session
6. presentation
7. application

---

### Slide with switch & router

The client is not **directly** connected to the server. There are switches, routers, proxies, CDNs, reverse proxies, load balancers ...
All these in the middle, look or peek at the content in different layers and they make decisions based on peeking.

- Switch makes the decision to where send the data based on peeking in data link layer(lvl 2), so it looks at the destination mac addr.
- Router send the data based on peeking on network layer(lvl 3), so based on destination IP.

So switch is lvl 2 device and router is lvl 3 device.

---

### Slide with switch & router
Firewall blocks apps from sending data or blocks certain unwanted packets to go through your network. In order to do that,
it needs to look at IP addresses(layer 3) and ports (layer 4). These firewalls are called transparent firewalls.

Why transparent?

**Because everything from layer 1 up to layer 4(transport) is transparent to everyone!** Everyone can read the info in these layers,
like IP addrs, ports. They're not encrypted. That's why your ISP can technically block you from going to any website they want(IPs).

NOTE: The transparent firewalls can't go above the transport layer because for example, if they wanna go to application layer,
they need to decrypt it and to do that, they need to serve the certificate of the server that the packet is headed for, and the
goverment doesn't have those certificates.

So goverment can only block IPs and transports by just blocking it, because the packets go through the ISP firewalls.

NOTE: We mentioned ISPs, that's because that's the first place your packets go through. That's why a lot of users use VPNs.
VPN is a layer 3 protocol. It takes the IP packets and put them in another IP packet. Though most VPNs don't do this!

Though some firewalls look at the application layer stuff too.

NOTE: We can **change** the packets and send them somewhere else than their original IP+port destination. For example, your ISP
can do that.

Since lvl 7 LBs and CDNs need to work on application layer, they're way slower than lvl 3 or 4 proxies & firewalls.

When client sends a req to lvl 7 LB or CDN, that's actually the final destination of client's conn. 
Becuase the conn between client & lvl 7 LB/CDN is different than the conn between lvl7 LB/CDN and the actual server.
So there are 2 separate TCP conns here. That's why LB & CDNs are called reverse proxies. Clients don't know anything about the
origin servers, they just send the req to LB/CDN.

Every CDN is a layer 7 reverse proxy.

## 7. Host to Host communication
Why did we invent Mac addresses, IP addresses and ports?

This lecture is mostly about layer 2 & a bit 3.

Even the virtual machines have virtual mac address.

The lowest level of communication addr is mac address.

When all hosts are connected to each other, it's called a mesh network.

- a lot of wasted resources
- security-wise dangerous: This is actually what happens in public network conn like wifis which are a form of mesh.
When a host sends frames, every host in wifi mesh get it. So a sniffer can get the packet and see it. So this is how network sniffing works,

The mac addresses are random, we need addresses that give us information about where to send a msg and where not to. We need routability.
That's why we invented IP address.

Router routes packets between two networks. It's a layer 3 device. Therefore, it needs to inspect the IP packets to see the IP addresses
in order to route.

IP addr is 4 bytes.

NOTE: localhost is an IP address that is loopback. When we use it, the msg won't leave the machine.

How do we determine the network section in an IP addr?

> In an IP addr like 192.168.1.0/24 , the first 24 bits (out of 32 total bits in an IPv4 address) are used for the network portion. 
> The remaining 8 bits are used for the host portion.

The router knows exactly where the machine is and will send the msg only to that machine.

### Subnet mask
A subnet mask is a 32-bit number (for IPv4) used to divide an IP address into two parts:

### Port
> To find which app(process) on a single host is looking for a msg, we need another fine-grained level of control beside the mac addr and ip addr.