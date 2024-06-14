class APIFeaturesQuery {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "search",
      "populate",
      "startDate",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  startDateFilter() {
    const startDate = this.queryString.startDate;

    if (startDate) {
      this.query = this.query.find({
        startDate: { $lte: new Date(startDate) },
      });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  populate() {
    if (this.queryString.populate) {
      const populateOptions = this.queryString.populate
        .split(",")
        .map((populate) => {
          const [path, fields] = populate.split(":");
          return {
            path: path,
            select: fields ? fields.split("|").join(" ") : "",
          };
        });

      populateOptions.forEach((opt) => {
        this.query = this.query.populate(opt);
      });
    }

    return this;
  }
}

export default APIFeaturesQuery;
