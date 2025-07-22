// new 

FROM node:20-slim

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libu2f-udev \
  libvulkan1 \
  libxss1 \
  libgbm1 \
  python3 \
  python3-pip \
  chromium \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip (more updated)
RUN pip install yt-dlp

# Set working directory
WORKDIR /usr/src/app

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci

# Copy rest of the files
COPY . .

# Build React frontend (assuming it's under /frontend and linked in package.json)
RUN npm run build

# Set Puppeteer executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Start the Node.js app
CMD ["npm", "start"]
