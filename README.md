iptables
--------

You will need to set up an iptables ``REDIRECT`` rule ::

  iptables -t nat -A PREROUTING -s <appliance_address>  -p tcp --dport 443 -j REDIRECT --to-ports 4430

This will accept packets from an appliance to port 443 and redirect them to local port 4430.

In a different scenario where the app is running on machine that is not a router/gateway, using OpenWrt, the following config may be applied
```
config 'redirect'
        option 'name' 'envd'
        option 'src' 'wan'
        option 'proto' 'tcp'
        option 'src_ip' '<appliance_address>'
        option 'src_dport' '443'
        option 'dest_ip' '<server_address>'
        option 'dest_port' '4430'
        option 'target' 'DNAT'
        option 'dest' 'lan'
```