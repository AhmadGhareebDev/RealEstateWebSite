const mongoose = require("mongoose")
const DATABASE_URL = process.env.DATABASE_URL;

const connectDataBase = async () => {
    const maxRetries = 5;
    const retryDelay = 5000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const conn = await mongoose.connect(DATABASE_URL, {
                serverSelectionTimeoutMS: 9000,
                socketTimeoutMS: 95000,
            });
            
            console.log(`Database connected: ${conn.connection.host}`);
            return conn;
            
        } catch (error) {
            console.error(`Database connection attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('Max connection attempts reached. Exiting...');
                process.exit(1);
            }
            
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

module.exports = connectDataBase