const express = require("express");
const app = express();
const WebsiteSearch = require("./search/WebsiteSearch")
const config = require("./config.json")

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

        res.status(400).json(responseJSON).send();
    } else {
        if(req.query.website.toLowerCase() === "zenmarket" || req.query.website.toLowerCase() === "ebay"
            || req.query.website.toLowerCase() === "mercarijp" || req.query.website.toLowerCase() === "mercarius"
            || req.query.website.toLowerCase() === "yahoo" || req.query.website.toLowerCase() === "sendico") {
            WebsiteSearch.search(req.query.website.toLowerCase(), req.query.query).then(resultJSON => {
                res.status(200).json(resultJSON);
            }).catch(err => {
                res.status(400).json(err);
            })

        } else {

            let responseJSON = {
                "response_status": "error",
                "error": "Improper parameters supplied",
                "error_description": "Invalid website supplied"
            }

            res.status(400).json(responseJSON).send();
        }

    }
});
