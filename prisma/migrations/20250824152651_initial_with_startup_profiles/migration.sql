-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "password_hash" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startup_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_info" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "profile_picture" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "website" TEXT,
    "birth_date" TIMESTAMP(3),
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_details" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "job_title" TEXT NOT NULL,
    "company" TEXT,
    "industry" TEXT NOT NULL,
    "experience" TEXT,
    "business_type" TEXT,
    "team_size" TEXT,
    "revenue" TEXT,
    "funding_stage" TEXT,
    "skills" TEXT,
    "goals" TEXT,
    "linkedin_profile" TEXT,
    "twitter_profile" TEXT,
    "github_profile" TEXT,
    "portfolio_website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_details" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "company_logo" TEXT,
    "company_name" TEXT NOT NULL,
    "founded_year" INTEGER NOT NULL,
    "company_email" TEXT NOT NULL,
    "company_phone" TEXT NOT NULL,
    "company_location" TEXT NOT NULL,
    "company_website" TEXT,
    "company_description" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "team_size" TEXT,
    "company_type" TEXT,
    "industry" TEXT NOT NULL,
    "revenue_range" TEXT,
    "legal_name" TEXT,
    "tax_id" TEXT,
    "registration_date" TIMESTAMP(3),
    "business_license" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerings" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "products" JSONB DEFAULT '[]',
    "services" JSONB DEFAULT '[]',
    "pricing_model" TEXT,
    "price_range" TEXT,
    "target_customers" TEXT,
    "revenue_streams" TEXT,
    "unique_value_proposition" TEXT,
    "competitive_advantage" TEXT,
    "support_model" TEXT,
    "onboarding_process" TEXT,
    "customer_success_strategy" TEXT,
    "future_offerings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "primary_industry" TEXT NOT NULL,
    "secondary_industry" TEXT,
    "primary_target_market" TEXT,
    "geographic_focus" TEXT,
    "market_description" TEXT,
    "partnership_goals" TEXT,
    "innovation_description" TEXT,
    "future_goals" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technology_interests" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "ai_ml" BOOLEAN NOT NULL DEFAULT false,
    "blockchain" BOOLEAN NOT NULL DEFAULT false,
    "cloud_computing" BOOLEAN NOT NULL DEFAULT false,
    "cybersecurity" BOOLEAN NOT NULL DEFAULT false,
    "iot" BOOLEAN NOT NULL DEFAULT false,
    "fintech" BOOLEAN NOT NULL DEFAULT false,
    "healthtech" BOOLEAN NOT NULL DEFAULT false,
    "edtech" BOOLEAN NOT NULL DEFAULT false,
    "sustainability_tech" BOOLEAN NOT NULL DEFAULT false,
    "other_tech" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technology_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnership_interests" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "startup_partnerships" BOOLEAN NOT NULL DEFAULT false,
    "enterprise_partnerships" BOOLEAN NOT NULL DEFAULT false,
    "research_collaborations" BOOLEAN NOT NULL DEFAULT false,
    "academic_partnerships" BOOLEAN NOT NULL DEFAULT false,
    "government_contracts" BOOLEAN NOT NULL DEFAULT false,
    "nonprofit_collaborations" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnership_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innovation_focus" (
    "id" SERIAL NOT NULL,
    "startup_profile_id" INTEGER NOT NULL,
    "product_development" BOOLEAN NOT NULL DEFAULT false,
    "process_innovation" BOOLEAN NOT NULL DEFAULT false,
    "business_model_innovation" BOOLEAN NOT NULL DEFAULT false,
    "sustainability_innovation" BOOLEAN NOT NULL DEFAULT false,
    "social_impact" BOOLEAN NOT NULL DEFAULT false,
    "disruptive_technology" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innovation_focus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "startup_profiles_user_id_key" ON "startup_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "personal_info_startup_profile_id_key" ON "personal_info"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_details_startup_profile_id_key" ON "business_details"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_details_startup_profile_id_key" ON "company_details"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "offerings_startup_profile_id_key" ON "offerings"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "interests_startup_profile_id_key" ON "interests"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "technology_interests_startup_profile_id_key" ON "technology_interests"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "partnership_interests_startup_profile_id_key" ON "partnership_interests"("startup_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "innovation_focus_startup_profile_id_key" ON "innovation_focus"("startup_profile_id");

-- AddForeignKey
ALTER TABLE "startup_profiles" ADD CONSTRAINT "startup_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_details" ADD CONSTRAINT "business_details_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_details" ADD CONSTRAINT "company_details_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interests" ADD CONSTRAINT "interests_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technology_interests" ADD CONSTRAINT "technology_interests_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_interests" ADD CONSTRAINT "partnership_interests_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_focus" ADD CONSTRAINT "innovation_focus_startup_profile_id_fkey" FOREIGN KEY ("startup_profile_id") REFERENCES "startup_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
