import mongoose from 'mongoose';

const employmentStatusSchema = new mongoose.Schema({
  code: { type: String, required: true },      // e.g. 'paye', 'w2', 'payg'
  label: { type: String, required: true },      // e.g. 'PAYE Employee'
  requiredFields: [String],                      // e.g. ['niNumber', 'taxCode', 'bankSortCode']
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { _id: false });

const territorySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // UK, US, CA, AU, etc.
    name: { type: String, required: true },
    flag: { type: String, required: true },      // Emoji flag
    region: {
      type: String,
      enum: ['Europe & UK', 'North America', 'Europe', 'Nordic', 'CEE', 'Asia-Pacific', 'Middle East & Africa', 'Latin America'],
      required: true,
    },
    defaultCurrency: { type: String, required: true }, // GBP, USD, CAD, etc.
    timezone: String,                              // e.g. 'GMT/BST'
    summary: String,                               // One-paragraph territory overview

    // Employment statuses available in this territory
    employmentStatuses: [employmentStatusSchema],

    // Tax credit schemes available
    taxCreditSchemes: [String],                    // e.g. ['HETVC', 'FTC'] for UK

    // Employer fringe defaults (territory-wide, overridden per agreement in TerritoryRule)
    defaultEmployerNicPct: Number,                 // UK 13.8%, US 7.65% FICA
    defaultPensionPct: Number,                     // UK 3%, AU 11.5%
    defaultHolidayPayPct: Number,                  // UK 12.07%, FR 10%
    defaultMileageRate: String,                    // UK '45p/mile', US '67¢/mile'

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Territory', territorySchema);
