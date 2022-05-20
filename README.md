# PSA

PSA (Product Search API) is meant to simplify our searches through the most common websites we use to find development, prototype, and general video game consoles or games

## Usage

### Websites

Currently supported websites are:
- eBay (US)
- Zenmarket (JP)

### Endpoints

```
<url>:3737/search?website={WEBSITE}&query={QUERY}
```

Parameters:

`website` - Which website to search on (one word, case insensitive)

`query` - Keywords to search on the given website (can be multiple words)


### Responses

Responses are returned in JSON and will look two different ways depending on the result.

No matter the result, every response will start with a `response_status`. This can be one of two options:

success - the query was successfully executed and returned

error - there was an error in your request or whilst executing your request

If the response_status is error, the response will have two additional fields:\

`error` - The general name of the error (usually short and to the point)
`error_description` - A description of the error in greater detail (will either be a more specific sentence or a stacktrace)

If the response_status is success, the collection of results will be stored in the response `results`

I will later update this file with how each result set should look for each website.
