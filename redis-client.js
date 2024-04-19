require("dotenv").config();
const redis = require("redis");

const redisClient = redis.createClient({
    host: 'redis',
    socket: {
        host: 'redis',
        rejectUnauthorized: true
    },
    port: 6379,
    password: 'A2Dp/B0+b8BGpidH8I2FmBnSqAvFZeFNiDQezT6zQISEsK5V3wWQhDTtDM2mRKNacnA1KH8pWp9K4/Kg',
    tls: undefined,
});

redisClient.connect().catch(console.error)

module.exports = redisClient;