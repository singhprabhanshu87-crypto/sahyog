export async function paginate(Model, { filter = {}, page = 1, limit = 20, sort = { createdAt: -1 }, populate = null }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  let query = Model.find(filter).sort(sort).skip(skip).limit(safeLimit);

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((p) => {
        query = query.populate(p);
      });
    } else {
      query = query.populate(populate);
    }
  }

  const [data, total] = await Promise.all([query.lean(), Model.countDocuments(filter)]);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 0,
      hasMore: safePage * safeLimit < total,
    },
  };
}

export default paginate;
