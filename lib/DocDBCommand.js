const fetch = require('node-fetch');
const { DEFAULT_BASE_URL, HEADERS } = require('./constants');
const { DocDBLibError } = require('./errors');

class DocDBCommand {
  constructor(options = {}) {
  }

  // Methods
//   async getDocument(collection, documentId) {
//     return this._request(`/collections/${collection}/documents/${documentId}`);
//   }

//   async createDocument(collection, document) {
//     return this._request(`/collections/${collection}/documents`, 'POST', document);
//   }

//   async updateDocument(collection, documentId, updates) {
//     return this._request(`/collections/${collection}/documents/${documentId}`, 'PATCH', updates);
//   }

//   async deleteDocument(collection, documentId) {
//     return this._request(`/collections/${collection}/documents/${documentId}`, 'DELETE');
//   }
}

module.exports = DocDBCommand;
