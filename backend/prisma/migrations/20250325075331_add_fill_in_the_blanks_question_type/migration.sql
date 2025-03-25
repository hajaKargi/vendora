/*
  Warnings:

  - You are about to drop the `sentence_orderings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "questions_createdBy_idx";

-- DropTable
DROP TABLE "sentence_orderings";

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
