

module.exports = {
  apps: [{
    name: 'autocarv5',
    script: './server.js',
    env: {
      NODE_ENV: 'development',
      SESSION_SECRET: '8pSnCe9YF1FehlBI1YcX1Z2Z6r90x7zRd0yBM+CPTZaGwkurNBDzybjgretUTO4l9LT7wRLZln1jqnpqjtKECw==',
      MONGODB_URI: 'mongodb+srv://raneaniket23_db_user:c51rYLvbIEDGX1qc@autocrm.fuz97x1.mongodb.net/?retryWrites=true&w=majority&appName=AUTOCRM',
      WHATSAPP_PHONE_NUMBER_ID: '919970127778',
      WHATSAPP_API_KEY: '7RlFwj57xE6wHngTfSmNHA',
      PORT: '5000'
    }
  }]
};


