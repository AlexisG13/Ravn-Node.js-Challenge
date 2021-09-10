-- CreateTable
CREATE TABLE "JwtBlackList" (
    "id" TEXT NOT NULL,
    "jwt" TEXT NOT NULL,

    CONSTRAINT "JwtBlackList_pkey" PRIMARY KEY ("id")
);
