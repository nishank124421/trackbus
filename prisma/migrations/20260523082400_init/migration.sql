-- CreateTable
CREATE TABLE "Bus" (
    "id" SERIAL NOT NULL,
    "route" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);
