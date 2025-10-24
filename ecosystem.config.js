
module.exports = {
  apps: [
    {
      name: 'abetworks-api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'abetworks-python-agents',
      script: 'python3',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2',
      cwd: './python-agents',
      interpreter: 'none',
      env: {
        PYTHONPATH: './python-agents',
        PYTHONUNBUFFERED: '1'
      },
      error_file: './logs/python-error.log',
      out_file: './logs/python-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
