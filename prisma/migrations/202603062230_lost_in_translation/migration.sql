-- CreateTable
CREATE TABLE `game_lost_in_translation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_by` INTEGER NOT NULL,
    `track_id` CHAR(22) NOT NULL,
    `original_text` TEXT NOT NULL,
    `translated_text` TEXT NOT NULL,
    `translation_chain` VARCHAR(512) NOT NULL,
    `context` VARCHAR(1024) NULL,

    UNIQUE INDEX `game_lost_in_translation_pk_2`(`id`),
    INDEX `game_lost_in_translation_track_sid_fk`(`track_id`),
    INDEX `game_lost_in_translation_user_id_fk`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `game_lost_in_translation` ADD CONSTRAINT `game_lost_in_translation_track_sid_fk` FOREIGN KEY (`track_id`) REFERENCES `track`(`sid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `game_lost_in_translation` ADD CONSTRAINT `game_lost_in_translation_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

