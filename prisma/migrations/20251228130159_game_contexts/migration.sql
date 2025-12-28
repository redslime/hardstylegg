-- AlterTable
ALTER TABLE `game_artwork` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_complete_album` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_complete_album_item` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_complete_lyrics` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_heardle` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_map` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_namex` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_order` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_order_item` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_quiz` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_quiz_item` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_timeline` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_timetable` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_timetable_item` ADD COLUMN `context` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `game_zoomer` ADD COLUMN `context` VARCHAR(1024) NULL;
