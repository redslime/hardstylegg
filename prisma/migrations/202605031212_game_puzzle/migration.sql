-- CreateTable
CREATE TABLE `game_puzzle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_by` INTEGER NOT NULL,
    `track_ids` VARCHAR(256) NOT NULL,
    `context` VARCHAR(1024) NULL,

    INDEX `game_puzzle_user_id_fk`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_puzzle` ADD CONSTRAINT `game_puzzle_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

