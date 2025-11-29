-- CreateTable
CREATE TABLE "public"."student_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_personal_info" (
    "id" SERIAL NOT NULL,
    "student_profile_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "headline" TEXT,
    "phone" TEXT NOT NULL,
    "gender" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_personal_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_education_records" (
    "id" SERIAL NOT NULL,
    "student_profile_id" INTEGER NOT NULL,
    "institution_name" TEXT NOT NULL,
    "degree_qualification" TEXT NOT NULL,
    "field_of_study" TEXT NOT NULL,
    "grade_copa" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_education_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_work_experiences" (
    "id" SERIAL NOT NULL,
    "student_profile_id" INTEGER NOT NULL,
    "company_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_skills" (
    "id" SERIAL NOT NULL,
    "student_profile_id" INTEGER NOT NULL,
    "selected_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certificate_records" (
    "id" SERIAL NOT NULL,
    "student_skills_id" INTEGER NOT NULL,
    "certificate_name" TEXT NOT NULL,
    "issuing_organization" TEXT,
    "issue_date" TIMESTAMP(3),
    "credential_id" TEXT,
    "credential_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "public"."student_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_personal_info_student_profile_id_key" ON "public"."student_personal_info"("student_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_skills_student_profile_id_key" ON "public"."student_skills"("student_profile_id");

-- AddForeignKey
ALTER TABLE "public"."student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_personal_info" ADD CONSTRAINT "student_personal_info_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_education_records" ADD CONSTRAINT "student_education_records_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_work_experiences" ADD CONSTRAINT "student_work_experiences_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_skills" ADD CONSTRAINT "student_skills_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "public"."student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificate_records" ADD CONSTRAINT "certificate_records_student_skills_id_fkey" FOREIGN KEY ("student_skills_id") REFERENCES "public"."student_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
