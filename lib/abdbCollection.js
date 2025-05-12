const {
  insertOneApi, findOneApi, updateOneApi, replaceOneApi, deleteOneApi, findApi, aggregateApi, bulkWriteApi,
  deleteManyApi, updateManyApi, insertManyApi
} = require('./api/collection')

class AbdbCollection {
  constructor(name, abdb) {
    this.name = name
    this.abdb = abdb
    this.tenantId = abdb.tenantId
    this.axiosClient = abdb.axiosClient
  }

  static init(name, abdb) {
    return new AbdbCollection(name, abdb)
  }

  // minimal sample that needs improvement
  async insertOne(document, options = {}) {
    return insertOneApi(this.tenantId, this.axiosClient, this.name, document, options)
  }

  async insertMany(documents, options = {}) {
    return insertManyApi(this.tenantId, this.axiosClient, this.name, documents, options)
  }

  async findOne(query, options = {}) {
    return findOneApi(this.tenantId, this.axiosClient, this.name, query, options)
  }

  async find(filter, options = {}) {
    return findApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  async updateOne(filter, update, options = {}) {
    return updateOneApi(this.tenantId, this.axiosClient, this.name, filter, update, options)
  }

  async updateMany(filter, update, options = {}) {
    return updateManyApi(this.tenantId, this.axiosClient, this.name, filter, update, options)
  }

  async replaceOne(filter, replacement, options = {}) {
    return replaceOneApi(this.tenantId, this.axiosClient, this.name, filter, replacement, options)
  }

  async deleteOne(filter, options = {}) {
    return deleteOneApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  async deleteMany(filter, options = {}) {
    return deleteManyApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  async aggregate(pipeline, options = {}) {
    return aggregateApi(this.tenantId, this.axiosClient, this.name, pipeline, options)
  }

  async bulkWrite(operations, options = {}) {
    return bulkWriteApi(this.tenantId, this.axiosClient, this.name, operations, options)
  }
}

module.exports = AbdbCollection
