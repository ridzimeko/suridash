#!/bin/bash

set -e

SET_NAME="suridash-blacklist"

echo "=== [0/6] Checking root permission ==="

if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo ./setup-ipset.sh"
    exit 1
fi


echo "=== [1/6] Installing ipset + iptables ==="

if command -v apt >/dev/null 2>&1; then
    echo "Detected Debian/Ubuntu"
    apt update -y
    apt install -y ipset iptables ipset-persistent netfilter-persistent

elif command -v yum >/dev/null 2>&1; then
    echo "Detected RHEL/CentOS/Rocky/Alma"
    yum install -y ipset iptables-services iptables

elif command -v apk >/dev/null 2>&1; then
    echo "Detected Alpine Linux"
    apk add ipset iptables

else
    echo "❌ Unsupported Linux distribution."
    exit 1
fi


echo "✔ ipset + iptables installed"


echo "=== [2/6] Creating ipset $SET_NAME ==="

ipset create $SET_NAME hash:ip family inet hashsize 4096 maxelem 65536 -exist

echo "✔ ipset '$SET_NAME' created or already exists"


echo "=== [3/6] Adding iptables DROP rule ==="

if iptables -C INPUT -m set --match-set $SET_NAME src -j DROP 2>/dev/null; then
    echo "✔ DROP rule already exists"
else
    echo "Adding rule..."
    iptables -I INPUT -m set --match-set $SET_NAME src -j DROP
    echo "✔ DROP rule inserted"
fi


echo "=== [4/6] Persist rules (if supported) ==="

if command -v netfilter-persistent >/dev/null 2>&1; then
    echo "Saving via netfilter-persistent"
    netfilter-persistent save

elif command -v service >/dev/null 2>&1 && service iptables save 2>/dev/null; then
    echo "Saving via service iptables"
    service iptables save || true
fi

# Alpine fallback
if command -v apk >/dev/null 2>&1; then
    echo "Saving ipset for Alpine"
    ipset save > /etc/ipset.conf
    echo -e '#!/bin/sh\nipset restore < /etc/ipset.conf' > /etc/local.d/ipset.start
    chmod +x /etc/local.d/ipset.start
    rc-update add local
fi

# Generic fallback
ipset save > /etc/ipset.conf || true

echo "✔ Persistence configured"


echo "=== [5/6] Testing ipset ==="
ipset list $SET_NAME || (echo "❌ ipset list failed" && exit 1)

echo "✔ ipset working"


echo "=== [6/6] Setup finished ==="

echo ""
echo "🎉 SUCCESS! ipset '$SET_NAME' is ready."
echo ""
echo "Commands you can use:"
echo "  ➤ Block IP:       sudo ipset add $SET_NAME 1.2.3.4"
echo "  ➤ Unblock IP:     sudo ipset del $SET_NAME 1.2.3.4"
echo "  ➤ View block list: sudo ipset list $SET_NAME"
echo ""
echo "Firewall automatically drops traffic from IPs in '$SET_NAME'."
