import mongoose from "mongoose";

class APIFeaturesAggregation {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
    this.pipeline = [];
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "district",
      "hospital",
      "specialities",
      "date",
      "name",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    if (Object.keys(queryObj).length > 0) {
      this.pipeline.push({ $match: JSON.parse(queryStr) });
    }

    return this;
  }

  districtFilter() {
    if (this.queryString.district) {
      const districtRegex = new RegExp(this.queryString.district, "i");

      this.pipeline.push({
        $match: {
          "hospital.district": { $regex: districtRegex },
        },
      });
    }

    return this;
  }

  hospitalFilter() {
    const lookupStage = {
      $lookup: {
        from: "hospitals",
        localField: "hospital",
        foreignField: "_id",
        as: "hospital",
      },
    };

    const unwindStage = {
      $unwind: "$hospital",
    };

    this.pipeline.push(lookupStage, unwindStage);

    if (this.queryString.hospital) {
      const hospitalRegex = new RegExp(this.queryString.hospital, "i");
      this.pipeline.push({
        $match: { "hospital.name": { $regex: hospitalRegex } },
      });
    }

    return this;
  }

  specialityFilter() {
    if (this.queryString.specialities) {
      const specialitiesArray = this.queryString.specialities
        .split(",")
        .map((s) => mongoose.Types.ObjectId.createFromHexString(s));

      this.pipeline.push({
        $match: {
          "specialities._id": { $in: specialitiesArray },
        },
      });
    }

    return this;
  }

  dateFilter() {
    if (this.queryString.date) {
      const dayOfWeek = new Date(this.queryString.date)
        .toLocaleString("en-US", { weekday: "short" })
        .toUpperCase();
      this.pipeline.push({ $match: { offDays: { $nin: [dayOfWeek] } } });
    }

    return this;
  }

  nameFilter() {
    if (this.queryString.name) {
      const nameRegex = new RegExp(this.queryString.name, "i");
      this.pipeline.push({ $match: { name: { $regex: nameRegex } } });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = {};
      const sortFields = this.queryString.sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortBy[field.slice(1)] = -1;
        } else {
          sortBy[field] = 1;
        }
      });
      this.pipeline.push({ $sort: sortBy });
    } else {
      this.pipeline.push({ $sort: { createdAt: -1 } });
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",");
      const projectObj = {};
      fields.forEach((field) => {
        if (!field.startsWith("-")) {
          projectObj[field] = 1;
        } else {
          projectObj[field.slice(1)] = 0;
        }
      });
      this.pipeline.push({ $project: projectObj });
    } else {
      this.pipeline.push({ $project: { __v: 0 } });
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.pipeline.push({
      $facet: {
        totalDocs: [
          {
            $count: "count",
          },
        ],
        paginatedResults: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],
      },
    });

    return this;
  }

  async exec() {
    return await this.model.aggregate(this.pipeline);
  }
}

export default APIFeaturesAggregation;
