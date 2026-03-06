-- AlterTable
ALTER TABLE `album` ADD COLUMN `hidden` BIT(1) NOT NULL DEFAULT b'0';

-- AlterTable
ALTER TABLE `track` ADD COLUMN `hidden` BIT(1) NOT NULL DEFAULT b'0';