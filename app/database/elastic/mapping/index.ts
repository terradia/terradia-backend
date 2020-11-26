import client from "../server";

client.indices.putMapping(
  {
    index: "companies",
    body: {
      properties: {
        company: {
          properties: {
            address: {
              type: "text"
            },
            name: {
              type: "text"
            }
          }
        },
        product: {
          properties: {
            description: {
              type: "text"
            },
            name: {
              type: "text"
            }
          }
        },
        company_relations: {
          type: "join",
          relations: {
            company: "product"
          }
        }
      }
    }
  },
  function(err, resp, status) {
    if (err) {
      console.log(err);
    } else {
      console.log(resp);
    }
  }
);
