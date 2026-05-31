/*
  Warnings:

  - Added the required column `namespaceId` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "namespaceId" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "functionalRoleId" TEXT NOT NULL,
    "dataRoleId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("tenantId","id")
);

-- CreateTable
CREATE TABLE "functional_roles" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "functional_roles_pkey" PRIMARY KEY ("tenantId","id")
);

-- CreateTable
CREATE TABLE "data_roles" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "data_roles_pkey" PRIMARY KEY ("tenantId","id")
);

-- CreateTable
CREATE TABLE "namespaces" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "namespaces_pkey" PRIMARY KEY ("tenantId","id")
);

-- CreateTable
CREATE TABLE "data_role_namespaces" (
    "tenantId" TEXT NOT NULL,
    "dataRoleId" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,

    CONSTRAINT "data_role_namespaces_pkey" PRIMARY KEY ("tenantId","dataRoleId","namespaceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "events_tenantId_idx" ON "events"("tenantId");

-- CreateIndex
CREATE INDEX "events_tenantId_namespaceId_idx" ON "events"("tenantId", "namespaceId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_functionalRoleId_fkey" FOREIGN KEY ("tenantId", "functionalRoleId") REFERENCES "functional_roles"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_dataRoleId_fkey" FOREIGN KEY ("tenantId", "dataRoleId") REFERENCES "data_roles"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "functional_roles" ADD CONSTRAINT "functional_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_roles" ADD CONSTRAINT "data_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namespaces" ADD CONSTRAINT "namespaces_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_role_namespaces" ADD CONSTRAINT "data_role_namespaces_tenantId_dataRoleId_fkey" FOREIGN KEY ("tenantId", "dataRoleId") REFERENCES "data_roles"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_role_namespaces" ADD CONSTRAINT "data_role_namespaces_tenantId_namespaceId_fkey" FOREIGN KEY ("tenantId", "namespaceId") REFERENCES "namespaces"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_tenantId_namespaceId_fkey" FOREIGN KEY ("tenantId", "namespaceId") REFERENCES "namespaces"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
