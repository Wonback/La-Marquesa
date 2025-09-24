import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { sequelize } from "./db";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: "Ha ocurrido un error en el servidor",
    error: err.message,
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos exitosa");
    await sequelize.sync({ force: false });
    console.log("Base de datos sincronizada correctamente");
  } catch (error: any) {
    console.error("Error al conectar o sincronizar la DB:", error.message);
  }
})();