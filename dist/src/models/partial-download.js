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
        let lastSuccessfulOffset = range.start;
        const downloadChunk = (startOffset) => {
            const options = {};
            options.headers = headers || {};
            options.headers.Range = `${accept_ranges_1.AcceptRanges.Bytes}=${startOffset}-${range.end}`;
            this.req = request.get(url, options)
                .on('error', (err) => {
                if (retryCount < this.MAX_RETRIES) {
                    retryCount++;
                    downloadChunk(lastSuccessfulOffset);
                }
                else {
                    this.emit('error', `Failed to get data-chunk after ${this.MAX_RETRIES} attempts. ${err}`);
                }
            })
                .on('data', (data) => {
                this.emit('data', data, startOffset);
                lastSuccessfulOffset += data.length;
            })
                .on('end', () => {
                this.emit('end');
            });
        };
        downloadChunk(lastSuccessfulOffset);
        return this;
    }
    abort() {
        this.req.abort();
    }
}
exports.PartialDownload = PartialDownload;
