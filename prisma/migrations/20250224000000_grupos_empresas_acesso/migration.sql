-- AlterTable
ALTER TABLE `UserGrupo` ADD COLUMN `acesso` VARCHAR(191) NOT NULL DEFAULT 'comum';

-- CreateTable
CREATE TABLE `GrupoEmpresa` (
    `grupoId` INTEGER NOT NULL,
    `empresaId` INTEGER NOT NULL,

    PRIMARY KEY (`grupoId`, `empresaId`),
    CONSTRAINT `GrupoEmpresa_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `GrupoEmpresa_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
