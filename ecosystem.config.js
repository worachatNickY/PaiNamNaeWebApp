// PM2 Ecosystem Configuration สำหรับ Production
// ใช้คำสั่ง: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      // ==================== Backend API ====================
      name: 'painamnae-backend',
      cwd: './backend',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      // ==================== Frontend Nuxt ====================
      name: 'painamnae-frontend',
      cwd: './frontend',
      script: '.output/server/index.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        NITRO_PORT: 3001
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
