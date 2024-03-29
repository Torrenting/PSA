const cheerio = require('cheerio');
const request = require('request');
const config = require('../config.json')
const puppeteer = require('puppeteer');
let eBay = require("ebay-node-api");
let useEbay = config["ebay-api-key"].length > 1;

function search(website, param) {
    return new Promise((resolve, reject) => {
    if(website === "ebay") {
        if(!useEbay) {
            reject({
                "response_status":"error",
                "error":"ebay API not properly configured"
            })
        } else {
            const ebay = new eBay({
                clientID: config["ebay-api-key"],
                clientSecret: config["ebay-api-secret"],
                body: {
                    grant_type: "client_credentials",
                    scope: "https://api.ebay.com/oauth/api_scope"
                }
            });
            ebay
                .findItemsByKeywords({
                    keywords: param,
                    sortOrder: "BestMatch",
                    pageNumber: 1,
                    limit: 10
                })
                .then(
                    data => {
                        let results = data[0]["searchResult"][0]["item"]
                        if (results !== undefined && results.length > 0) {
                            let items = []
                            for (let i = 0; i < results.length; i++) {
                                items.push({
                                    title: results[i]["title"][0],
                                    link: results[i]["viewItemURL"][0]
                                })
                            }
                            resolve({
                                "response_status": "success",
                                "results": items
                            })
                        } else {
                            reject({
                                "response_status": "error",
                                "error": "No results found",
                                "error_description": "No results found"
                            })
                        }
                    },
                    error => {
                        reject({
                            "response_status": "error",
                            "error": "An error has occurred",
                            "error_description": error
                        })
                    }
                );
        }
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
                    "error": "No results found",
                    "error_description": "No results found"
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
                "error": "An error has occurred",
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
            console.log(err)
            reject({
                "response_status": "error",
                "error": "error whilst parsing mercari",
                "error_description": err
            })
        })

    } else if(website === "mercarius") {
        let base_url = "https://www.mercari.com/search?keyword=" + param;
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

    } else if(website === "yahoo") {
        param = encodeURIComponent(param)
        let base_url = 'https://auctions.yahoo.co.jp/search/search?auccat=&tab_ex=commerce&ei=utf-8&aq=-1&oq=&sc_i=&fr=auc_top&p='
        let sort = '&x=0&y=0'
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
            let selector = $('a.Product__imageLink.js-rapid-override.js-browseHistory-add')
            let amount = selector.length;
            for(let i = 0; i < amount; i++) {
                if (selector[i].attribs.href.indexOf('/auction/') !== -1) {
                    let data = {
                        "title": selector[i].attribs["data-auction-title"],
                        "link": selector[i].attribs.href
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
    } else if(website === "sendico") {
        param = encodeURIComponent(param)
        let base_url = 'https://www.sendico.com/browse?category=&query='
        let fullUrl = base_url + param
        request({
            method: 'GET',
            url: fullUrl
        }, (err, res, body) => {
            let items = []
            if(typeof body !== "string") {
                body = body.toString()
            }
            let $ = cheerio.load(body);
            let selector = $('h3.product-item-title > a')
            let amount = selector.length;
            for(let i = 0; i < amount; i++) {
                if (selector[i].attribs.href.indexOf('/item/') !== -1) {
                    let data = {
                        "title": $(selector[i]).text(),
                        "link": selector[i].attribs.href
                    }
                    items.push(data)
                }
            }
            if(items.length === 0) {
                reject({
                    "response_status":"error",
                    "error": "No results found",
                    "error_description": "No results found"
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
                "error": "Error parsing request",
                "error_description": err
            })
        })
    } else if(website === "taobao") {
        let base_url = 'https://parcelup.com/shop/?p=search&search='
        let sort = "&sort_by=UpdatedTime%3ADesc"
        let fullUrl = base_url + encodeURIComponent(param) + sort
        searchTaobao(fullUrl).then(results => {
            resolve({
                "response_status": "success",
                "results": results
            })
        }).catch(err => {
            reject({
                "response_status": "error",
                "error": "error whilst parsing taobao",
                "error_description": err
            })
        })
    }
    })
}

async function searchMercariJP(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
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
            return reject(e);
        }
    })
}

async function searchMercariUS(url) {

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForNetworkIdle()
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll("a.Text__LinkText-sc-441b8d37-0-a.Link__StyledAnchor-sc-c96f6437-0.Link__StyledPlainLink-sc-c96f6437-3.eSSYiT.eqUXag");
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
            return reject(e);
        }
    })
}

async function searchTaobao(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36");
            await page.goto(url);
            await page.waitForNetworkIdle()
            let urls = await page.evaluate(() => {
                let results = [];
                let linkList = [];
                let itemList = [];
                let links = document.querySelectorAll("a.item-list_img-wrap");
                links.forEach((link) => {
                    linkList.push("https://item.taobao.com/item.htm?id=" + link.getAttribute("href").split("=")[1])
                });

                let names = document.querySelectorAll("img.check-noimg.main-photo");
                names.forEach((item) => {
                    itemList.push(item.getAttribute("alt"));
                })

                for(let i = 0; i < itemList.length; i++) {
                    results.push({
                        title: itemList[i],
                        link: linkList[i]
                    })
                }

                return results;
            })
            await browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}

module.exports = { search };
