const dbConfig = {
  DB: "newspaper_cgso",

  USER: "robin",

  PASSWORD: "IkjztUv2JDBnaiPWl0hL0sKL1wybdE1L",

  HOST: "dpg-ct6n5v2lqhvc73art3lg-a",

  dialect: "postgres",

  pool: {
    max: 5,

    min: 0,

    acquire: 30000,

    idle: 10000,
  },
};

export default dbConfig;
