import mongoose from 'mongoose';

/**
 * Paginated find with lean and select
 */
export const findWithPagination = async (Model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    select = '',
    sort = { createdAt: -1 },
    populate = []
  } = options;

  const skip = (page - 1) * limit;
  const pipeline = [
    ...populate.map(p => ({ $lookup: { from: p.ref || p.model, localField: p.path || p.localField, foreignField: '_id', as: p.as || p.path, pipeline: [{ $project: { ...p.select && { [p.select]: 1, _id: 0 } } }] } })),
    { $match: query },
    { $sort: sort },
    { $skip },
    { $limit: parseInt(limit) },
    ...(select ? [{ $project: select.split(' ').reduce((acc, f) => ({ ...acc, [f]: 1 }), { _id: 1 }) }] : [])
  ];

  const [data, total] = await Promise.all([
    Model.aggregate(pipeline).exec(),
    Model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

/**
 * Batch lookup for company metrics (optimize N+1)
 */
export const getCompanyMetricsBatch = async (companyIds) => {
  const [financials, hrMetrics] = await Promise.all([
    // Latest financials per company
    mongoose.model('FinancialMetrics').aggregate([
      { $match: { companyId: { $in: companyIds } } },
      { $sort: { companyId: 1, createdAt: -1 } },
      { $group: { _id: '$companyId', data: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$data' } }
    ]).exec(),
    // Latest HR metrics per company
    mongoose.model('HRMetrics').aggregate([
      { $match: { companyId: { $in: companyIds } } },
      { $sort: { companyId: 1, createdAt: -1 } },
      { $group: { _id: '$companyId', data: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$data' } }
    ]).exec()
  ]);

  const finMap = new Map(financials.map(f => [f.companyId.toString(), f]));
  const hrMap = new Map(hrMetrics.map(h => [h.companyId.toString(), h]));

  return { financials: finMap, hrMetrics: hrMap };
};

export default { findWithPagination, getCompanyMetricsBatch };

