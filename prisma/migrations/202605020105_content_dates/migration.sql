-- AlterTable
ALTER TABLE `album` ADD COLUMN `date` DATE NOT NULL DEFAULT '1970-01-01';

-- AlterTable
ALTER TABLE `track` ADD COLUMN `date` DATE NOT NULL DEFAULT '1970-01-01';

-- AlterTable
ALTER TABLE `album` DROP COLUMN `year`;

-- AlterTable
ALTER TABLE `track` DROP COLUMN `year`;