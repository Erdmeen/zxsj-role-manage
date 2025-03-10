module.exports = {
  apps: [{
    name: 'task-manager',
    script: 'index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      JWT_SECRET: 'erdmeen'
    }
  }]
}; 