# PSA

PSA (Product Search API) is meant to simplify our searches through the most common websites we use to find development, prototype, and general video game consoles or games

## Usage

### Websites

Currently supported websites are:
- eBay* - `ebay`
- Zenmarket (JP) - `zenmarket`
- Mercari (JP) - `mercariJP`
- Mercari (US) - `mercariUS`
- Yahoo Auctions (JP) - `yahoo`
- Sendico (JP) - `sendico`
- Taobao (CN) - `taobao`

\* = requires setup in the config.json (see below)

## Config
The config.json file serves two purposes:
  - Supplying the port for the server
  - Supplying the eBay API and secret keys

The port is required for the server to run and is set to `3737` by default

The eBay API and secret keys are only required if you plan to use the eBay API. You can find those keys by signing up to the eBay developer program, and generating **PRODUCTION** keys (not sandbox, these will not return actual data).

## Endpoints

```
<url>:{PORT}/search?website={WEBSITE}&query={QUERY}
```

## Parameters

`website` - Which website to search on (one word, case insensitive, see list of websites for allowed parameters [use the word in the code block after the dash])

`query` - Keywords to search on the given website (can be multiple words)


## Responses

Responses are returned in JSON and will look two different ways depending on the result.

No matter the result, every response will start with a `response_status`. This can be one of two options:

success - the query was successfully executed and returned

error - there was an error in your request or whilst executing your request

## Error

If the response_status is error, the response will have two additional fields:

`error` - The general name of the error (usually short and to the point)

`error_description` - A description of the error in greater detail (will either be a more specific sentence or a stacktrace)

## Success
If the response_status is success, the collection of results will be stored in the response `results`

Results will look the same for every website. Results returns a collection of items that each have the following:

`title` - the name of the item (can be English or Japanese depending on the website you use)


`link` - the link to the item
