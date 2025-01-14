"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialRequestQuery = void 0;
const request = require("request");
class PartialRequestQuery {
    getMetadata(url, headers) {
        return new Promise((resolve, reject) => {
            const options = {};
            options.headers = headers || null;
            request.head(url, options, (err, res, body) => {
                if (err) {
                    return reject(err);
                }
                const metadata = {
                    acceptRanges: res.headers['accept-ranges'],
                    contentLength: parseInt(res.headers['content-length'], 10),
                };
                return resolve(metadata);
            });
        });
    }
}
exports.PartialRequestQuery = PartialRequestQuery;
