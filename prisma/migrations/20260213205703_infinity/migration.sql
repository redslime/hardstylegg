-- CreateTable
CREATE TABLE `infinity` (
    `code` CHAR(6) NOT NULL,
    `type_ids` VARCHAR(1024) NOT NULL,
    `game_ids` VARCHAR(1024) NOT NULL,

    UNIQUE INDEX `infinity_pk_2`(`code`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
