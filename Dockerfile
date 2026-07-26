# 🚀 Puppeteer ka official image jisme Chrome pehle se installed hota hai
FROM ghcr.io/puppeteer/puppeteer:22.10.0

# Server ke andar ek 'app' naam ka folder banana
WORKDIR /app

# Sabse pehle package files copy karke dependencies install karna
COPY package*.json ./
RUN npm ci

# Baaki ka poora backend code copy karna
COPY . .

# Port set karna
ENV PORT=5000
EXPOSE 5000

# 🔥 Server aur Scheduler dono ko ek sath background me live karne ki command
CMD ["sh", "-c", "node server.js & node scheduler.js"]