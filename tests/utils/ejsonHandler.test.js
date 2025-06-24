const { cleanParse } = require("../../utils/ejsonHandler")
const { Long, ObjectId, Decimal128 } = require("bson")

describe('ejsonHandler tests', () => {
  test('Converts JSON-parsed EJSON to BSON except for javascript primitives', () => {
    // Example response from find API call
    const jsonParsed = JSON.parse('{'
      + '  "success": true,'
      + '  "data": {'
      + '    "cursor": {'
      + '      "firstBatch": ['
      + '        {'
      + '          "_id": { "$oid": "68472f05fd54a5e0dad30cba" },' // Should result in bson ObjectId
      + '          "name": "Mechanical Keyboard",'
      + '          "price": { "$numberDouble": "199.99" }' // Should result in a primitive number
      + '        },'
      + '        {'
      + '          "_id": { "$oid": "68472f05fd54a5e0dad30cbb" },' // Should result in bson ObjectId
      + '          "name": "Classic Keyboard",'
      + '          "price": { "$numberDecimal": "39.99" }' // Should result in bson Decimal128
      + '        }'
      + '      ],'
      + '      "id": { "$numberLong": "5461853363952707584" },' // Should result in bson Long
      + '      "ns": "db_test_namespace.default_collection"'
      + '    },'
      + '    "ok": { "$numberInt": "1" }' // Should result in a primitive number
      + '  }'
      + '}')

    // The same data with EJSON ObjectId and Long types but primitive numbers
    const expected = {
      success: true,
      data: {
        cursor: {
          firstBatch: [
            {
              _id: new ObjectId("68472f05fd54a5e0dad30cba"),
              name: "Mechanical Keyboard",
              price: 199.99
            },
            {
              _id: new ObjectId("68472f05fd54a5e0dad30cbb"),
              name: "Classic Keyboard",
              price: new Decimal128('39.99')
            }
          ],
          id: Long.fromString("5461853363952707584"),
          ns: "db_test_namespace.default_collection"
        },
        ok: 1
      }
    }

    const cleanParsed = cleanParse(jsonParsed)
    expect(cleanParsed).toEqual(expected)
  })
})
