-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastStreakDate" TEXT;

-- CreateTable DailyChallenge
CREATE TABLE IF NOT EXISTS "daily_challenges" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "daily_challenges_date_key" ON "daily_challenges"("date");
CREATE INDEX IF NOT EXISTS "daily_challenges_date_idx" ON "daily_challenges"("date");
CREATE INDEX IF NOT EXISTS "daily_challenges_problemId_idx" ON "daily_challenges"("problemId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'daily_challenges_problemId_fkey'
    ) THEN
        ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable UserDailyStreak
CREATE TABLE IF NOT EXISTS "user_daily_streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_daily_streaks_userId_date_key" ON "user_daily_streaks"("userId", "date");
CREATE INDEX IF NOT EXISTS "user_daily_streaks_userId_idx" ON "user_daily_streaks"("userId");
CREATE INDEX IF NOT EXISTS "user_daily_streaks_date_idx" ON "user_daily_streaks"("date");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_daily_streaks_userId_fkey'
    ) THEN
        ALTER TABLE "user_daily_streaks" ADD CONSTRAINT "user_daily_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_daily_streaks_problemId_fkey'
    ) THEN
        ALTER TABLE "user_daily_streaks" ADD CONSTRAINT "user_daily_streaks_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable DailyChallengeAttempt
CREATE TABLE IF NOT EXISTS "daily_challenge_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "submitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenge_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "daily_challenge_attempts_userId_date_key" ON "daily_challenge_attempts"("userId", "date");
CREATE INDEX IF NOT EXISTS "daily_challenge_attempts_userId_idx" ON "daily_challenge_attempts"("userId");
CREATE INDEX IF NOT EXISTS "daily_challenge_attempts_date_idx" ON "daily_challenge_attempts"("date");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'daily_challenge_attempts_userId_fkey'
    ) THEN
        ALTER TABLE "daily_challenge_attempts" ADD CONSTRAINT "daily_challenge_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

