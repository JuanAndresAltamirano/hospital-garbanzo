module.exports = {
    apps: [
      {
        name: "clinicamullo-api",
        script: "dist/main.js",
        env: {
          NODE_ENV: "production",
          DB_HOST: "localhost",
          DB_PORT: "3306",
          DB_USERNAME: "clinica_user",
          DB_PASSWORD: "your_secure_password",
          DB_DATABASE: "clinica_mullo",
          JWT_SECRET: "your-super-secret-key",
          JWT_EXPIRATION: "1d",
          UPLOAD_DIR: "uploads"
        }
      }
    ]
  }