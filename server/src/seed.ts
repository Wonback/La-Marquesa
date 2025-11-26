import { sequelize } from './db';
import { Usuario } from './Models/Usuario';
import { Cliente } from './Models/Cliente';
import { Insumo } from './Models/Insumo';
import { Producto } from './Models/Producto';
import { Receta } from './Models/Receta';
import { DetalleReceta } from './Models/DetalleReceta';
import { Pedido } from './Models/Pedido';
import { DetallePedido } from './Models/DetallePedido';
import { Cobro } from './Models/Cobro';
import { faker } from '@faker-js/faker';
import { applyAssociations } from './Models/associations'; 

// Aplicamos asociaciones antes de empezar
applyAssociations();

async function seed() {
  try {
    // Limpiamos la base de datos
    await sequelize.sync({ force: true }); 
    console.log('✅ Base de datos sincronizada y limpia.');

    // ----------------------------------------------------
    // 1. USUARIOS
    // ----------------------------------------------------
    console.log('🌱 Sembrando Usuarios...');
    
    // Usamos un array y un bucle for para usar .create() individualmente
    // Esto asegura que se ejecute el hook beforeCreate y se hashee la contraseña
    const usuariosData = [
      { nombre: 'Admin User', email: 'admin@lamarquesa.com', password: 'admin123', rol: 'Admin' },
      { nombre: 'Ventas User', email: 'ventas@lamarquesa.com', password: 'ventas123', rol: 'Ventas' },
      { nombre: 'Produccion User', email: 'produccion@lamarquesa.com', password: 'prod123', rol: 'Producción' }
    ];

    for (const u of usuariosData) {
      // @ts-ignore (ignoramos el tipado estricto del enum aquí para simplificar el seed)
      await Usuario.create(u);
    }

    // ----------------------------------------------------
    // 2. CLIENTES
    // ----------------------------------------------------
    console.log('🌱 Sembrando Clientes...');
    const clientes = [];
    for (let i = 0; i < 10; i++) {
      clientes.push(await Cliente.create({
        nombre: faker.person.fullName(),
        email: faker.internet.email(),
        telefono: faker.phone.number(),
        direccion: faker.location.streetAddress(),
        localidad: faker.location.city()
      }));
    }

    // ----------------------------------------------------
    // 3. INSUMOS (Inventario)
    // ----------------------------------------------------
    console.log('🌱 Sembrando Insumos...');
    const insumos = [];
    const insumoData = [
      { nombre: 'Harina 0000', unidad: 'kg' },
      { nombre: 'Azúcar Ledesma', unidad: 'kg' },
      { nombre: 'Huevos Blancos', unidad: 'u' },
      { nombre: 'Leche Entera', unidad: 'l' },
      { nombre: 'Chocolate Águila', unidad: 'kg' },
      { nombre: 'Manteca', unidad: 'kg' },
      { nombre: 'Levadura Fresca', unidad: 'gr' },
      { nombre: 'Esencia de Vainilla', unidad: 'ml' },
      { nombre: 'Dulce de Leche', unidad: 'kg' },
      { nombre: 'Crema de Leche', unidad: 'l' },
    ];

    for (const data of insumoData) {
      insumos.push(await Insumo.create({
        nombre: data.nombre,
        unidad_medida: data.unidad,
        stock: faker.number.int({ min: 10, max: 100 }),
        stock_minimo: faker.number.int({ min: 5, max: 20 })
      }));
    }

    // ----------------------------------------------------
    // 4. PRODUCTOS
    // ----------------------------------------------------
    console.log('🌱 Sembrando Productos...');
    const productos = [];
    const productoData = [
      { nombre: 'Torta Matilda', es_elaborado: true },
      { nombre: 'Cheesecake de Frutos Rojos', es_elaborado: true },
      { nombre: 'Brownie con Nueces', es_elaborado: true },
      { nombre: 'Alfajores de Maicena (Docena)', es_elaborado: true },
      { nombre: 'Tarta de Frutilla', es_elaborado: true },
      { nombre: 'Lemon Pie', es_elaborado: true },
      { nombre: 'Coca Cola 2.25L', es_elaborado: false },
      { nombre: 'Velas de Cumpleaños', es_elaborado: false }
    ];

    for (const p of productoData) {
      productos.push(await Producto.create({
        nombre: p.nombre,
        descripcion: faker.commerce.productDescription(),
        precio: parseFloat(faker.commerce.price({ min: 1500, max: 25000 })),
        stock: faker.number.int({ min: 0, max: 50 }),
        es_elaborado: p.es_elaborado
      }));
    }

    // ----------------------------------------------------
    // 5. RECETAS
    // ----------------------------------------------------
    console.log('🌱 Sembrando Recetas...');
    for (const producto of productos) {
      if (producto.es_elaborado) {
        const receta = await Receta.create({
          nombre: `Fórmula de ${producto.nombre}`,
          descripcion: 'Mezclar ingredientes secos, luego húmedos. Hornear a 180°C.',
          producto_id: producto.id
        });

        const numIngredients = faker.number.int({ min: 3, max: 6 });
        const shuffledInsumos = insumos.sort(() => 0.5 - Math.random()).slice(0, numIngredients);

        for (const insumo of shuffledInsumos) {
          await DetalleReceta.create({
            receta_id: receta.id,
            insumo_id: insumo.id,
            cantidad: faker.number.float({ min: 0.1, max: 2, fractionDigits: 2 })
          });
        }
      }
    }

    // ----------------------------------------------------
    // 6. PEDIDOS
    // ----------------------------------------------------
    console.log('🌱 Sembrando Pedidos...');
    for (let i = 0; i < 15; i++) {
      const cliente = clientes[faker.number.int({ min: 0, max: clientes.length - 1 })];
      const estados = ['registrado', 'confirmado', 'en producción', 'listo', 'entregado'];
      
      const pedido = await Pedido.create({
        cliente_id: cliente.id,
        fecha_entrega: faker.date.soon({ days: 10 }),
        estado: faker.helpers.arrayElement(estados)
      });

      let totalPedido = 0;
      const numItems = faker.number.int({ min: 1, max: 4 });
      const shuffledProductos = productos.sort(() => 0.5 - Math.random()).slice(0, numItems);

      for (const producto of shuffledProductos) {
        const cantidad = faker.number.int({ min: 1, max: 3 });
        
        // ⚡ AQUÍ ESTÁ LA CORRECCIÓN CLAVE: Definimos 'precio' antes de usarlo
        const precio = Number(producto.precio); 
        const subtotal = cantidad * precio; 
        
        totalPedido += subtotal;

        await DetallePedido.create({
          pedido_id: pedido.id,
          producto_id: producto.id,
          cantidad: cantidad,
          precio_unitario: precio, // Ahora 'precio' existe y es un número
          subtotal: subtotal,      // Ahora 'subtotal' existe
          observaciones: Math.random() > 0.7 ? 'Sin TACC / Extra dulce' : null
        });
      }

      // ----------------------------------------------------
      // 7. COBROS
      // ----------------------------------------------------
      if (['entregado', 'listo'].includes(pedido.estado)) {
        if (Math.random() > 0.2) { 
          await Cobro.create({
            pedido_id: pedido.id,
            monto: totalPedido,
            fecha: new Date(),
            metodo_pago: faker.helpers.arrayElement(['efectivo', 'debito', 'transferencia'])
          });
        }
      }
    }

    console.log('✨ Seed completado con éxito! ✨');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error critical en el seed:', error);
    process.exit(1);
  }
}

seed();