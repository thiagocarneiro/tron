-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "category" TEXT;

-- CreateTable
CREATE TABLE "StudentSchedule" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentScheduleSlot" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "workoutId" TEXT,
    "isRest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentSchedule_assignmentId_key" ON "StudentSchedule"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentScheduleSlot_scheduleId_dayOfWeek_key" ON "StudentScheduleSlot"("scheduleId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "StudentSchedule" ADD CONSTRAINT "StudentSchedule_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ProgramAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScheduleSlot" ADD CONSTRAINT "StudentScheduleSlot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "StudentSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScheduleSlot" ADD CONSTRAINT "StudentScheduleSlot_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
