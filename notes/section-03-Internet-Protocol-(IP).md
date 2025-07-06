# 8. The IP Building Blocks
When we say packet is layer 3, it means, when inspecting the packet at layer 3, it only has
`source IP addr + data + destination IP addr`(and some other headers). So at this layer, we don't care about ports and ... .
The ports and ... are in the packet, but at this layer we don't care.

The subnet mask is used when we wanna know is this IP addr that we wanna send a packet to, belongs to my subnet or not?
If the receiver IP addr is in my subnet, we can use the receiver mac addr to send it directly, because the receiver
is in the same network as us.

But if receiver is not in the same subnet, we need to talk to someone who knows how to route this packet(usually called router or gateway).

### Default gateway
The gateway has two network interfaces. One for internal network(or subnet - if you consider logical networks),
one for an external network. Note that there could be multiple external interfaces to talk to multiple external networks.

The gateway might not know an IP addr, it might ask another gateway for it!

When sending packets to router in order to route it to another network, an attack could happen like ARP poisoning or spoofing.
Someone could pretend to be the router! So every packet is gonna go through it.
So the sender sends the packet to the router using router's mac addr.

NOTE: A router has multiple IP addresses, one for each network.

---

Example of a delay because of router:

If the DB lives in another subnet than our backend app, the packets sent between these two are sent to a router. Now if the
router becomes congested, we're gonna have delays. So it's better to put them in the same subnet

## 9. IP Packet
TTL of an IP packet: Used to prevent infinite loop in the path of an IP packet.
The sender estimates how many hops a packet will pass until it reaches it's destination. Let's say 100. Then every hop(like a router or ...),
will decrement this number by 1. Now whoever decrements the num to 0, must drop the packet and must send back an ICMP packet to the
source IP addr.

Congestion: Routers in order to process the packets, need a certain amount of memory called the buffer. If there are too many packets
coming in or the router is slow because it has to do a lot of things to process the packet, this memory can fill up and if it fills,
it can't accept new packets, so it has to drop incoming packets. This is called `congestion`.

For a long time, routers would always drop the packets in case of their memory buffer was full. They even don't send back an ICMP msg.
Now the client says: Ok, my packet is timed out because I didn't see an acknowledgment. So I'm gonna assume it was dropped and there
was congestion. But there's a lot of waste here because the timeout is so long. So we need better communication.
Meet ECN. When the buffer of router is **about to**(not completely filled) fills up, the router won't drop the incoming packets instead,
it sets ECN to true and processes the packet. Then the receiver receives the packet with ECN=true and say: Oh some of the router(there could
be multiple routes in the path) experienced congestion and will reply back to the sender with the same ECN=true. So everyone will know
eventually that there was a congestion(without any packets being dropped).

## 10. ICMP, PING, TraceRoute

## 11. ARP

## 12. Capturing IP, ARP and ICMP Packets with TCPDUMP

## 13. Routing Example

## 14. Quick Quiz - IP


## 15. Private IP addresses (Alaska Airlines WIFI example)
