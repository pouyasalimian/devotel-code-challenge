-- CreateEnum
CREATE TYPE "WorkModeEnum" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" SERIAL NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_job_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "work_mode" "WorkModeEnum" NOT NULL DEFAULT 'ONSITE',
    "employment_type" TEXT,
    "experience_required" INTEGER,
    "min_salary" INTEGER,
    "max_salary" INTEGER,
    "currency" TEXT,
    "date_posted" TIMESTAMP(3),
    "company_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "requirements" TEXT[],

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_city_state_key" ON "locations"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_offers_provider_id_provider_job_id_key" ON "job_offers"("provider_id", "provider_job_id");

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
