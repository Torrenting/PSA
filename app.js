const express = require("express");
const app = express();
const WebsiteSearch = require("./search/WebsiteSearch")
const config = require("./config.json")
const websites = ["zenmarket", "ebay", "mercarijp", "mercarius", "yahoo", "sendico"]
const port = config["port"];

app.listen(port, () => {
    console.log("Server running on port " + port);
});

app.get("/search", (req, res, next) => {
    if(
        req.query.length !== 2 && (!req.query.website
        || !req.query.query)
    ) {
        let error

        if(req.query.length !== 2) error = "(Incorrect number of parameters)"
        else error = "(Incorrect parameter types)"

        let responseJSON = {
            "response_status": "error",
            "error": "Improper parameters supplied",
            "error_description": error
        }

        res.status(200).json(responseJSON).send();
    } else {
        if(websites.includes(req.query.website.toLowerCase())) {
            WebsiteSearch.search(req.query.website.toLowerCase(), req.query.query).then(resultJSON => {
                res.status(200).json(resultJSON);
            }).catch(err => {
                res.status(200).json(err);
            })

        } else {

            let responseJSON = {
                "response_status": "error",
                "error": "Improper parameters supplied",
                "error_description": "Invalid website supplied"
            }

            res.status(200).json(responseJSON).send();
        }

    }
});
