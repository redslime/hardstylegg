-- CreateTable
CREATE TABLE `list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_by` INTEGER NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `name` VARCHAR(512) NOT NULL,
    `description` VARCHAR(2048) NULL,
    `icon` VARCHAR(128) NULL,

    INDEX `list_user_id_fk`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `list_item` (
    `parent_id` INTEGER NOT NULL,
    `item_id` CHAR(22) NOT NULL,
    `index` INTEGER NOT NULL,
    `context` VARCHAR(1024) NULL,

    PRIMARY KEY (`parent_id`, `item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `list` ADD CONSTRAINT `list_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `list_item` ADD CONSTRAINT `list_item_list_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

