import { Sequelize, Dialect } from "sequelize";
export { DataTypes, Model } from "sequelize";
export const sequelize = new Sequelize({
  dialect: process.env.DB_DRIVER as Dialect,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  define: {
    underscored: false,
    charset: "utf8",
    collate: "utf8_general_ci",
    timestamps: true,
  },
  logQueryParameters: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

export const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
export const sync = async () => {
  try {
    await sequelize.sync({
      alter: process.env.NODE_ENV === "development",
      logging: false,
    });
    console.log(`Models synchronized successfully`);
  } catch (error) {
    console.error("Unable to sync:", error);
  }
};
