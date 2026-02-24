-- CreateTable ConfigNotificacao
CREATE TABLE `ConfigNotificacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `notificacoesLigado` BOOLEAN NOT NULL DEFAULT true,
    `diasAntes` INTEGER NOT NULL DEFAULT 30,
    `frequencia` VARCHAR(191) NOT NULL DEFAULT 'diaria',
    `horario` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `enviarParaGoogleCalendar` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConfigNotificacao_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConfigNotificacao` ADD CONSTRAINT `ConfigNotificacao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
