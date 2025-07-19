import dgram from 'dgram'

const socket = dgram.createSocket('udp4')

socket.bind(5500, '127.0.0.1')

socket.on('message', (msg, rinfo) => {
    console.log(`server got a datagram ${msg}, ${rinfo.address}:${rinfo.port}`)
})