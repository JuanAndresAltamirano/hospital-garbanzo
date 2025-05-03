import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPromotionalPrice1745940655778 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE promotions ADD COLUMN "promotionalPrice" decimal(10,2) DEFAULT 0`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE promotions DROP COLUMN "promotionalPrice"`
        );
    }

}
