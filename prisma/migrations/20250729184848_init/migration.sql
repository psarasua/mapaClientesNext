-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Codigo" TEXT NOT NULL,
    "Razon" TEXT,
    "Nombre" TEXT NOT NULL,
    "Direccion" TEXT,
    "Telefono1" TEXT,
    "Ruc" TEXT,
    "Activo" INTEGER NOT NULL DEFAULT 1,
    "Coordenada_x" REAL,
    "Coordenada_y" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "diasEntrega" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descripcion" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "repartos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "diasEntrega_id" INTEGER NOT NULL,
    "camion_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "repartos_diasEntrega_id_fkey" FOREIGN KEY ("diasEntrega_id") REFERENCES "diasEntrega" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "repartos_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "trucks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientesporReparto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reparto_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ClientesporReparto_reparto_id_fkey" FOREIGN KEY ("reparto_id") REFERENCES "repartos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientesporReparto_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_usuario_key" ON "users"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "clients_Codigo_key" ON "clients"("Codigo");

-- CreateIndex
CREATE UNIQUE INDEX "diasEntrega_descripcion_key" ON "diasEntrega"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "ClientesporReparto_reparto_id_cliente_id_key" ON "ClientesporReparto"("reparto_id", "cliente_id");
