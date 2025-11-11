import Joi from 'joi';

export const personalInfoSchema = Joi.object({
  profile_picture: Joi.string().uri().optional().allow(''),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).allow('').optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).max(20).required(),
  location: Joi.string().min(2).max(100).allow('').optional(),
  website: Joi.string().uri().optional().allow(''),
  birth_date: Joi.date().optional().allow(null),
  bio: Joi.string().max(1000).optional().allow('')
});

export const businessDetailsSchema = Joi.object({
  job_title: Joi.string().min(2).max(100).required(),
  company: Joi.string().max(100).required(),
  industry: Joi.string().min(2).max(100).optional().allow(''),
  experience: Joi.string().max(50).optional().allow(''),
  business_type: Joi.string().max(50).optional().allow(''),
  team_size: Joi.string().max(50).optional().allow(''),
  revenue: Joi.string().max(50).optional().allow(''),
  funding_stage: Joi.string().max(50).optional().allow(''),
  skills: Joi.string().max(1000).optional().allow(''),
  goals: Joi.string().max(1000).optional().allow(''),
  linkedin_profile: Joi.string().uri().required(),
  twitter_profile: Joi.string().uri().optional().allow(''),
  github_profile: Joi.string().uri().optional().allow(''),
  portfolio_website: Joi.string().uri().optional().allow('')
});

export const companyDetailsSchema = Joi.object({
  company_logo: Joi.string().uri().optional().allow(''),
  company_name: Joi.string().min(2).max(100).required(),
  founded_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  company_email: Joi.string().email().required(),
  company_phone: Joi.string().min(8).max(20).required(),
  company_location: Joi.string().min(2).max(100).optional().allow(''),
  company_website: Joi.string().optional().allow(''),
  company_description: Joi.string().min(10).max(1000).optional().allow(''),
  vision: Joi.string().min(10).max(500).optional().allow(''),
  mission: Joi.string().min(10).max(500).optional().allow(''),
  team_size: Joi.string().max(50).optional().allow(''),
  company_type: Joi.string().max(50).optional().allow(''),
  industry: Joi.string().min(2).max(100).optional().allow(''),
  revenue_range: Joi.string().max(50).optional().allow(''),
  legal_name: Joi.string().max(100).optional().allow(''),
  tax_id: Joi.string().max(50).optional().allow(''),
  registration_date: Joi.date().optional().allow(''),
  business_license: Joi.string().max(100).optional().allow('')
});

export const offeringsSchema = Joi.object({
  // Array Fields - be more lenient with array validation
  products: Joi.array().items(Joi.string().allow('')).default([]),
  services: Joi.array().items(Joi.string().allow('')).default([]),
  revenue_streams: Joi.array().items(Joi.string().allow('')).default([]),
  partnerships: Joi.array().items(Joi.string().allow('')).default([]),
  certifications: Joi.array().items(Joi.string().allow('')).default([]),
  
  // String Fields - be more lenient
  pricing_model: Joi.string().max(100).allow('', null).optional(),
  target_market: Joi.string().max(1000).allow('', null).optional(),
  value_proposition: Joi.string().max(1000).allow('', null).optional(),
  competitive_advantage: Joi.string().max(1000).allow('', null).optional(),
  business_model: Joi.string().max(100).allow('', null).optional(),
});


// export const interestsSchema = Joi.object({
//   primary_industry: Joi.string().min(2).max(100).required(),
//   secondary_industry: Joi.string().max(100).optional().allow(''),
//   primary_target_market: Joi.string().max(100).optional().allow(''),
//   geographic_focus: Joi.string().max(100).optional().allow(''),
//   market_description: Joi.string().max(1000).optional().allow(''),
//   partnership_goals: Joi.string().max(1000).optional().allow(''),
//   innovation_description: Joi.string().max(1000).optional().allow(''),
//   future_goals: Joi.string().max(1000).optional().allow('')
// });

// Define the combined schema
export const interestsAndRelatedSchema = Joi.object({
    // Interests (The required fields from the original interestsSchema)
    primary_industry: Joi.string().min(2).max(100).required(), // REQUIRED
    secondary_industry: Joi.string().max(100).optional().allow(''),
    primary_target_market: Joi.string().max(100).optional().allow(''),
    geographic_focus: Joi.string().max(100).optional().allow(''),
    market_description: Joi.string().max(1000).optional().allow(''),
    partnership_goals: Joi.string().max(1000).optional().allow(''),
    innovation_description: Joi.string().max(1000).optional().allow(''),
    future_goals: Joi.string().max(1000).optional().allow(''),

    // Technology Interests (Booleans are optional)
    ai_ml: Joi.boolean().optional(),
    blockchain: Joi.boolean().optional(),
    cloud_computing: Joi.boolean().optional(),
    cybersecurity: Joi.boolean().optional(),
    iot: Joi.boolean().optional(),
    fintech: Joi.boolean().optional(),
    healthtech: Joi.boolean().optional(),
    edtech: Joi.boolean().optional(),
    sustainability_tech: Joi.boolean().optional(),
    other_tech: Joi.string().max(255).optional().allow(''),

    // Partnership Interests (Booleans are optional)
    startup_partnerships: Joi.boolean().optional(),
    enterprise_partnerships: Joi.boolean().optional(),
    research_collaborations: Joi.boolean().optional(),
    academic_partnerships: Joi.boolean().optional(),
    government_contracts: Joi.boolean().optional(),
    nonprofit_collaborations: Joi.boolean().optional(),

    // Innovation Focus (Booleans are optional)
    product_development: Joi.boolean().optional(),
    process_innovation: Joi.boolean().optional(),
    business_model_innovation: Joi.boolean().optional(),
    sustainability_innovation: Joi.boolean().optional(),
    social_impact: Joi.boolean().optional(),
    disruptive_technology: Joi.boolean().optional()
});

export const technologyInterestsSchema = Joi.object({
  ai_ml: Joi.boolean().optional(),
  blockchain: Joi.boolean().optional(),
  cloud_computing: Joi.boolean().optional(),
  cybersecurity: Joi.boolean().optional(),
  iot: Joi.boolean().optional(),
  fintech: Joi.boolean().optional(),
  healthtech: Joi.boolean().optional(),
  edtech: Joi.boolean().optional(),
  sustainability_tech: Joi.boolean().optional(),
  other_tech: Joi.string().max(255).optional().allow('')
});

export const partnershipInterestsSchema = Joi.object({
  startup_partnerships: Joi.boolean().optional(),
  enterprise_partnerships: Joi.boolean().optional(),
  research_collaborations: Joi.boolean().optional(),
  academic_partnerships: Joi.boolean().optional(),
  government_contracts: Joi.boolean().optional(),
  nonprofit_collaborations: Joi.boolean().optional()
});

export const innovationFocusSchema = Joi.object({
  product_development: Joi.boolean().optional(),
  process_innovation: Joi.boolean().optional(),
  business_model_innovation: Joi.boolean().optional(),
  sustainability_innovation: Joi.boolean().optional(),
  social_impact: Joi.boolean().optional(),
  disruptive_technology: Joi.boolean().optional()
});

// Combined schema for multiple sections
export const combinedSectionsSchema = Joi.object({
  // Interests section
  primary_industry: Joi.string().min(2).max(100).optional(),
  secondary_industry: Joi.string().max(100).optional().allow(''),
  primary_target_market: Joi.string().max(100).optional().allow(''),
  geographic_focus: Joi.string().max(100).optional().allow(''),
  market_description: Joi.string().max(1000).optional().allow(''),
  partnership_goals: Joi.string().max(1000).optional().allow(''),
  innovation_description: Joi.string().max(1000).optional().allow(''),
  future_goals: Joi.string().max(1000).optional().allow(''),
  
  // Technology interests section
  ai_ml: Joi.boolean().optional(),
  blockchain: Joi.boolean().optional(),
  cloud_computing: Joi.boolean().optional(),
  cybersecurity: Joi.boolean().optional(),
  iot: Joi.boolean().optional(),
  fintech: Joi.boolean().optional(),
  healthtech: Joi.boolean().optional(),
  edtech: Joi.boolean().optional(),
  sustainability_tech: Joi.boolean().optional(),
  other_tech: Joi.string().max(255).optional().allow(''),
  
  // Partnership interests section
  startup_partnerships: Joi.boolean().optional(),
  enterprise_partnerships: Joi.boolean().optional(),
  research_collaborations: Joi.boolean().optional(),
  academic_partnerships: Joi.boolean().optional(),
  government_contracts: Joi.boolean().optional(),
  nonprofit_collaborations: Joi.boolean().optional(),
  
  // Innovation focus section
  product_development: Joi.boolean().optional(),
  process_innovation: Joi.boolean().optional(),
  business_model_innovation: Joi.boolean().optional(),
  sustainability_innovation: Joi.boolean().optional(),
  social_impact: Joi.boolean().optional(),
  disruptive_technology: Joi.boolean().optional()
});

