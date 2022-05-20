var express = require("express");
var app = express();
var WebsiteSearch = require("./search/WebsiteSearch")
const fs = require("fs");

var port = 3737
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
        if(req.query.website.toLowerCase() === "zenmarket" || req.query.website.toLowerCase() === "ebay") {
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
