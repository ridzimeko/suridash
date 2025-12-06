FROM node:20-bullseye

# Install ipset + iptables so the container can call them on host (requires privileges)
RUN apt-get update && apt-get install -y ipset iptables sudo

WORKDIR /app

# Copy package files early for caching
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Allow running sudo ipset commands without password inside container
RUN echo "node ALL=(ALL) NOPASSWD: /usr/sbin/ipset, /usr/sbin/iptables" >> /etc/sudoers

EXPOSE 3000

CMD ["npm", "run", "start"]
