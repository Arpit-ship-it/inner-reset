// PM2 Configuration for Production Deployment
// Usage: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [{
    name: 'affirmation-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork', // Use 'fork' for WhatsApp client (not 'cluster')
    autorestart: true,
    watch: false, // Disable in production
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    
    // Restart strategies
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Advanced features
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
