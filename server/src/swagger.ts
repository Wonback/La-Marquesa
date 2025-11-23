const swaggerServerUrl = process.env.SWAGGER_SERVER_URL || "http://localhost:4000";

const bearerSecurity = [{ bearerAuth: [] }];

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "La Marquesa API",
    version: "1.0.0",
    description:
      "Colección de endpoints del backend de La Marquesa. Utiliza estas definiciones para probar cada flujo directamente desde Swagger UI.",
    contact: {
      name: "Equipo de La Marquesa",
      email: "soporte@lamarquesa.com",
    },
  },
  servers: [{ url: swaggerServerUrl }],
  tags: [
    { name: "Autenticación", description: "Flujos para registrar y autenticar usuarios" },
    { name: "Clientes", description: "Operaciones relacionadas con clientes" },
    { name: "Pedidos", description: "Administración de pedidos y estados" },
    { name: "Productos", description: "Catálogo de productos" },
    { name: "Insumos", description: "Stock y detalle de insumos" },
    { name: "Cobros", description: "Registro y seguimiento de cobros" },
    { name: "Recetas", description: "Ingredientes asociados a productos elaborados" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["nombre", "email", "password", "rol"],
        properties: {
          nombre: { type: "string", example: "Ana" },
          email: { type: "string", format: "email", example: "ana@lamarquesa.com" },
          password: { type: "string", format: "password", example: "S3gura!" },
          rol: {
            type: "string",
            enum: ["Ventas", "Producción", "Admin"],
            example: "Ventas",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ana@lamarquesa.com" },
          password: { type: "string", format: "password", example: "S3gura!" },
        },
      },
      Cliente: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          telefono: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      Producto: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          es_elaborado: { type: "boolean" },
          precio: { type: "number", format: "double" },
        },
      },
      Insumo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          stock: { type: "integer" },
          stock_minimo: { type: "integer" },
        },
      },
      Pedido: {
        type: "object",
        properties: {
          id: { type: "integer" },
          cliente_id: { type: "integer" },
          fecha_entrega: { type: "string", format: "date" },
          estado: { type: "string", example: "registrado" },
        },
      },
      PedidoRequest: {
        type: "object",
        required: ["cliente_id", "fecha_entrega"],
        properties: {
          cliente_id: { type: "integer", example: 1 },
          fecha_entrega: { type: "string", format: "date", example: "2024-09-12" },
          detalle: {
            type: "array",
            description: "Detalle opcional del pedido",
            items: {
              type: "object",
              properties: {
                producto_id: { type: "integer", example: 1 },
                cantidad: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
      Cobro: {
        type: "object",
        properties: {
          id: { type: "integer" },
          pedido_id: { type: "integer" },
          fecha: { type: "string", format: "date-time" },
          monto: { type: "number", format: "double" },
          metodo_pago: { type: "string" },
        },
      },
      CobroRequest: {
        type: "object",
        required: ["pedido_id", "monto", "metodo_pago"],
        properties: {
          pedido_id: { type: "integer", example: 12 },
          monto: { type: "number", format: "double", example: 950.5 },
          metodo_pago: { type: "string", example: "transferencia" },
          fecha: { type: "string", format: "date-time" },
        },
      },
      Receta: {
        type: "object",
        properties: {
          id: { type: "integer" },
          producto_id: { type: "integer" },
        },
      },
      RecetaRequest: {
        type: "object",
        required: ["producto_id"],
        properties: {
          producto_id: { type: "integer" },
          insumos: {
            type: "array",
            description: "Detalle de insumos y cantidades",
            items: {
              type: "object",
              properties: {
                insumo_id: { type: "integer" },
                cantidad: { type: "number" },
              },
            },
          },
        },
      },
      Mensaje: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Autenticación"],
        summary: "Registrar un nuevo usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuario creado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    usuario: { $ref: "#/components/schemas/Cliente" },
                  },
                },
              },
            },
          },
          400: { description: "Datos inválidos" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Autenticar usuario y obtener token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Token emitido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    usuario: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        nombre: { type: "string" },
                        email: { type: "string" },
                        rol: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Credenciales inválidas" },
        },
      },
    },
    "/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Listar clientes",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Listado de clientes",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Cliente" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Clientes"],
        summary: "Crear cliente",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Cliente" },
            },
          },
        },
        responses: {
          201: { description: "Cliente creado" },
        },
      },
    },
    "/clientes/{id}": {
      get: {
        tags: ["Clientes"],
        summary: "Obtener cliente por ID",
        security: bearerSecurity,
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "Cliente encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } },
          },
          404: { description: "Cliente no encontrado" },
        },
      },
      put: {
        tags: ["Clientes"],
        summary: "Actualizar cliente",
        security: bearerSecurity,
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Cliente" },
            },
          },
        },
        responses: { 200: { description: "Cliente actualizado" } },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Eliminar cliente",
        security: bearerSecurity,
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" } },
        ],
        responses: { 204: { description: "Cliente eliminado" } },
      },
    },
    "/productos": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Listado de productos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Producto" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Productos"],
        summary: "Crear producto",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Producto" },
            },
          },
        },
        responses: { 201: { description: "Producto creado" } },
      },
    },
    "/productos/{id}": {
      get: {
        tags: ["Productos"],
        summary: "Obtener producto",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Producto", content: { "application/json": { schema: { $ref: "#/components/schemas/Producto" } } } },
          404: { description: "Producto no encontrado" },
        },
      },
      put: {
        tags: ["Productos"],
        summary: "Actualizar producto",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Producto" } } },
        },
        responses: { 200: { description: "Producto actualizado" } },
      },
      delete: {
        tags: ["Productos"],
        summary: "Eliminar producto",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 204: { description: "Producto eliminado" } },
      },
    },
    "/insumos": {
      get: {
        tags: ["Insumos"],
        summary: "Listar insumos",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Listado de insumos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Insumo" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Insumos"],
        summary: "Crear insumo",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Insumo" } },
          },
        },
        responses: { 201: { description: "Insumo creado" } },
      },
    },
    "/insumos/{id}": {
      get: {
        tags: ["Insumos"],
        summary: "Obtener insumo",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Insumo", content: { "application/json": { schema: { $ref: "#/components/schemas/Insumo" } } } },
          404: { description: "Insumo no encontrado" },
        },
      },
      put: {
        tags: ["Insumos"],
        summary: "Actualizar insumo",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Insumo" } } },
        },
        responses: { 200: { description: "Insumo actualizado" } },
      },
      delete: {
        tags: ["Insumos"],
        summary: "Eliminar insumo",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 204: { description: "Insumo eliminado" } },
      },
    },
    "/pedidos": {
      get: {
        tags: ["Pedidos"],
        summary: "Listar pedidos",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Listado de pedidos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Pedido" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Pedidos"],
        summary: "Crear pedido",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PedidoRequest" } },
          },
        },
        responses: { 201: { description: "Pedido creado" } },
      },
    },
    "/pedidos/{id}": {
      get: {
        tags: ["Pedidos"],
        summary: "Obtener pedido",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Pedido", content: { "application/json": { schema: { $ref: "#/components/schemas/Pedido" } } } },
          404: { description: "Pedido no encontrado" },
        },
      },
      delete: {
        tags: ["Pedidos"],
        summary: "Eliminar pedido",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 204: { description: "Pedido eliminado" } },
      },
    },
    "/pedidos/{id}/confirmar": {
      put: {
        tags: ["Pedidos"],
        summary: "Confirmar pedido",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Pedido confirmado" } },
      },
    },
    "/pedidos/{id}/estado": {
      put: {
        tags: ["Pedidos"],
        summary: "Actualizar estado del pedido",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["estado"],
                properties: { estado: { type: "string", example: "en_proceso" } },
              },
            },
          },
        },
        responses: { 200: { description: "Estado actualizado" } },
      },
    },
    "/cobros": {
      get: {
        tags: ["Cobros"],
        summary: "Listar cobros",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Listado de cobros",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Cobro" } } } },
          },
        },
      },
      post: {
        tags: ["Cobros"],
        summary: "Registrar cobro",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CobroRequest" } },
          },
        },
        responses: { 201: { description: "Cobro registrado" } },
      },
    },
    "/cobros/{id}": {
      get: {
        tags: ["Cobros"],
        summary: "Obtener cobro",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Cobro", content: { "application/json": { schema: { $ref: "#/components/schemas/Cobro" } } } },
          404: { description: "Cobro no encontrado" },
        },
      },
      put: {
        tags: ["Cobros"],
        summary: "Actualizar cobro",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CobroRequest" } } },
        },
        responses: { 200: { description: "Cobro actualizado" } },
      },
      delete: {
        tags: ["Cobros"],
        summary: "Eliminar cobro",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 204: { description: "Cobro eliminado" } },
      },
    },
    "/recetas": {
      get: {
        tags: ["Recetas"],
        summary: "Listar recetas",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Listado de recetas",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Receta" } } } },
          },
        },
      },
      post: {
        tags: ["Recetas"],
        summary: "Crear receta",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RecetaRequest" } } },
        },
        responses: { 201: { description: "Receta creada" } },
      },
    },
    "/recetas/{id}": {
      get: {
        tags: ["Recetas"],
        summary: "Obtener receta",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Receta", content: { "application/json": { schema: { $ref: "#/components/schemas/Receta" } } } },
          404: { description: "Receta no encontrada" },
        },
      },
      put: {
        tags: ["Recetas"],
        summary: "Actualizar receta",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RecetaRequest" } } },
        },
        responses: { 200: { description: "Receta actualizada" } },
      },
      delete: {
        tags: ["Recetas"],
        summary: "Eliminar receta",
        security: bearerSecurity,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 204: { description: "Receta eliminada" } },
      },
    },
  },
};

export const swaggerUiHtml = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>La Marquesa API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/docs.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
        });
      };
    </script>
  </body>
</html>`;

export default swaggerDocument;
