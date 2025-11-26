import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import bcrypt from 'bcrypt';

export class Usuario extends Model {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public password!: string;
  public rol!: 'Ventas' | 'Producción' | 'Admin';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para verificar contraseña
  public validarPassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('Ventas', 'Producción', 'Admin'),
      allowNull: false,
      defaultValue: 'Ventas',
    },
  },
  { sequelize, tableName: 'usuarios', timestamps: true }
);


Usuario.beforeCreate(async (user, options) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});
