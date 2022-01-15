class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1a) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // 1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const querySorted = this.queryString.sort.replace(/,/g, ' ');
      this.query = this.query.sort(querySorted);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const queryFields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(queryFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const queryPage = +this.queryString.page || 1;
    const queryLimit = +this.queryString.limit || 100;
    const skip = (queryPage - 1) * queryLimit;
    this.query = this.query.skip(skip).limit(queryLimit);
    return this;
  }
}

module.exports = APIFeatures;
