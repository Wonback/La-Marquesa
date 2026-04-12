import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET no está definido en el archivo .env. El servidor no puede iniciar.");
  process.exit(1);
}
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { sequelize } from "./db";
import { applyAssociations } from "./Models/associations";

// Apply associations
applyAssociations(); 
import clientesRoutes from "./Routes/clienteRoutes";
import pedidosRoutes from "./Routes/pedidosRoutes";
import productosRoutes from "./Routes/productosRoutes";
import insumosRoutes from "./Routes/insumoRoutes";
import authRoutes from "./Routes/authRoutes";
import cobrosRoutes from "./Routes/cobrosRoutes";
import recetasRoutes from "./Routes/recetaRoutes";
import dashboardRoutes from "./Routes/dashboardRoutes";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:4200"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/productos", productosRoutes);
app.use("/insumos", insumosRoutes);
app.use("/cobros", cobrosRoutes);
app.use("/recetas", recetasRoutes);
app.use("/dashboard", dashboardRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: "Ha ocurrido un error en el servidor",
    error: err.message,
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port} - CORS habilitado para 3000 y 4200`);
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
