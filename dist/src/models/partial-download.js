"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialDownload = void 0;
const events = require("events");
const request = require("request");
const accept_ranges_1 = require("./accept-ranges");
class PartialDownload extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this.MAX_RETRIES = 3;
    }
    start(url, range, headers) {
        let retryCount = 0;
        const downloadChunk = (offset) => {
            const options = {};
            options.headers = headers || {};
            options.headers.Range = `${accept_ranges_1.AcceptRanges.Bytes}=${offset}-${range.end}`;
            this.req = request.get(url, options)
                .on('error', (err) => {
                this.req.abort();
                if (retryCount < this.MAX_RETRIES) {
                    retryCount++;
                    downloadChunk(offset);
                }
                else {
                    this.emit('error', `Failed to get data-chunk after ${this.MAX_RETRIES} attempts. ${err}`);
                }
            })
                .on('data', (data) => {
                this.emit('data', data, offset);
                offset += data.length;
            })
                .on('end', () => {
                this.emit('end');
            });
        };
        downloadChunk(range.start);
        return this;
    }
    abort() {
        this.req.abort();
    }
}
exports.PartialDownload = PartialDownload;
