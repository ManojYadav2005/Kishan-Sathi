const mongoose = require('mongoose');

const ploughingServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    providerName: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    village: {
      type: String,
      required: [true, 'Village/local area is required'],
      trim: true,
    },
    rates: {
      type: Map,
      of: Number,
      required: [true, 'Rates for selected equipment are required']
    },
    equipment: {
      type: [String],
      required: [true, 'At least one type of equipment must be selected'],
    },
    rate: {
      type: Number,
      required: [true, 'Ploughing rate per bigha is required'],
    },
    tractorDetails: {
      type: String,
      default: null,
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ploughingServiceSchema.pre('validate', function() {
  if (this.rates) {
    let keys = [];
    let values = [];
    if (typeof this.rates.keys === 'function') {
      keys = Array.from(this.rates.keys());
      this.rates.forEach((val) => values.push(val));
    } else {
      keys = Object.keys(this.rates);
      values = Object.values(this.rates);
    }
    this.equipment = keys;
    const minRate = Math.min(...values);
    this.rate = isFinite(minRate) ? minRate : 0;
  }
});

module.exports = mongoose.model('PloughingService', ploughingServiceSchema);
