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

## 2. IP Packet

## 3. ICMP, PING, TraceRoute

## 4. ARP

## 5. Capturing IP, ARP and ICMP Packets with TCPDUMP

## 6. Routing Example

## 7. Quick Quiz - IP


## 8. Private IP addresses (Alaska Airlines WIFI example)
