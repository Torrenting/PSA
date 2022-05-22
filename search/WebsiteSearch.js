let eBay = require("ebay-node-api");
const cheerio = require('cheerio');
const request = require('request');
const config = require('../config.json')
const puppeteer = require('puppeteer');

let ebay = new eBay({
    clientID: config["ebay-api-key"],
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
                "error": "There was an error with your request",
                "error_description": error
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

    } else if(website === "mercarijp") {
        let base_url = "https://jp.mercari.com/search?keyword=" + param;
        searchMercariJP(base_url).then(results => {
            resolve({
                "response_status": "success",
                "results": results
            })
        }).catch(err => {
            reject({
                "response_status": "error",
                "error": "error whilst parsing mercari",
                "error_description": err
            })
        })

    } else if(website === "mercarius") {
        let base_url = "https://mercari.com/search?keyword=" + param;
        searchMercariUS(base_url).then(results => {
            resolve({
                "response_status": "success",
                "results": results
            })
        }).catch(err => {
            reject({
                "response_status": "error",
                "error": "error whilst parsing mercari",
                "error_description": err
            })
        })

    }
    })
}

async function searchMercariJP(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForNetworkIdle()
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll("a.ItemGrid__StyledThumbnailLink-sc-14pfel3-2.dPGTBN");
                items.forEach((item) => {
                    if(item.getAttribute('href').indexOf("/item/") !== -1) {
                        results.push({
                            title: item.innerText,
                            link: "https://jp.mercari.com" + item.getAttribute('href')
                        });
                    }
                });
                return results;
            })
            await browser.close();
            return resolve(urls);
        } catch (e) {
            console.log(e)
            return reject(e);
        }
    })
}

async function searchMercariUS(url) {

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForNetworkIdle()
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll("a.Text__LinkText-sc-1e98qiv-0-a.Link__StyledAnchor-dkjuk2-0.fiIUU.Link__StyledPlainLink-dkjuk2-3.beSDvJ");
                items.forEach((item) => {
                    if(item.getAttribute('href').indexOf("/item/") !== -1) {
                        results.push({
                            title: item.innerText,
                            link: "https://mercari.com" + item.getAttribute('href')
                        });
                    }
                });
                return results;
            })
            await browser.close();
            return resolve(urls);
        } catch (e) {
            console.log(e)
            return reject(e);
        }
    })
}

module.exports = { search };
