let eBay = require("ebay-node-api");
const rp = require('request-promise');
const cheerio = require('cheerio');
const request = require('request')

let ebay = new eBay({
    clientID: "-- Client APP ID ----",
    env: "SANDBOX", // optional default = 'PRODUCTION'
    headers: {
        // optional
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
    }
});

function search(website, param) {
    return new Promise((resolve, reject) => {
    if(website === "ebay") {
        ebay.findItemsByKeywords({
            keywords: param,
            sortOrder: 'BestMatch', //https://developer.ebay.com/devzone/finding/callref/extra/fndcmpltditms.rqst.srtordr.html
            Condition: 3000,
            SoldItemsOnly: false,
            affiliate: {
                networkId: 9,
                trackingId: 1234567890
            }
        }).then((data) => {
            resolve( {
                "response_status": "success",
                "results": data
            });
        }, (error) => {
            reject( {
                "response_status": "error",
                "error_description": "There was an error with your request",
                "error_result": error
            })
        });

    } else if (website === "zenmarket") {
        param = encodeURIComponent(param)
        let base_url = 'https://zenmarket.jp/en/yahoo.aspx?q='
        let sort = '&sort=endtime&order=asc'
        let fullUrl = base_url + param + sort
        request({
            method: 'GET',
            url: fullUrl
        }, (err, res, body) => {
            let items = []
            if(typeof body !== "string") {
                body = body.toString()
            }
            let $ = cheerio.load(body);
            let selector = $('a.auction-url')
            let amount = selector.length;
            for(let i = 0; i < amount; i++) {
                if (selector[i].attribs.href.indexOf('auction.aspx') !== -1) {
                    let data = {
                        "title": $(selector[i]).text(),
                        "link": "https://zenmarket.jp/en/" + selector[i].attribs.href
                    }
                    items.push(data)
                }
            }
            if(items.length === 0) {
                reject({
                    "response_status":"error",
                    "error": "No results found"
                })
            } else {
                resolve({
                    "response_status": "success",
                    "results": items
                })
            }
        }).on('error', function (err) {
            reject({
                "response_status":"error",
                "error_description": err
            })
        })

    }
    })
}

module.exports = { search };