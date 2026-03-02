-- AlterTable User: add role, status, approvedAt, approvedBy
ALTER TABLE `User` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'usuario';
ALTER TABLE `User` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pendente';
ALTER TABLE `User` ADD COLUMN `approvedAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `approvedBy` INTEGER NULL;

-- CreateTable Grupo
CREATE TABLE `Grupo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable UserGrupo
CREATE TABLE `UserGrupo` (
    `userId` INTEGER NOT NULL,
    `grupoId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `grupoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable TipoCertidao
CREATE TABLE `TipoCertidao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `TipoCertidao_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable Certidao: add grupoId
ALTER TABLE `Certidao` ADD COLUMN `grupoId` INTEGER NULL;

-- AddForeignKey UserGrupo
ALTER TABLE `UserGrupo` ADD CONSTRAINT `UserGrupo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `UserGrupo` ADD CONSTRAINT `UserGrupo_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Certidao
ALTER TABLE `Certidao` ADD CONSTRAINT `Certidao_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex Certidao grupoId
CREATE INDEX `Certidao_grupoId_idx` ON `Certidao`(`grupoId`);
