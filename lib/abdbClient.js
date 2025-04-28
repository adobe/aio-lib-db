const { dbStatsApi, closeApi } = require('./api/client')
const AbdbCollection = require('./abdbCollection')

class AbdbClient {
  constructor(abdb) {
    this.abdb = abdb;
    this.tenantId = abdb.tenantId;
    this.axiosClient = abdb.axiosClient;
  }
  static async init(abdb) {
    return new AbdbClient(abdb)
  }
  async dbStats() {
    return dbStatsApi(this.tenantId, this.axiosClient);
  }
  async close() {
    await closeApi(this.tenantId, this.axiosClient);
    this.abdb.connected = false;
  }
  collection(name) {
    return AbdbCollection.init(name, this.abdb)
  }
}

module.exports = AbdbClient
