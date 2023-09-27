"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultOperation = void 0;
const events = require("events");
const file_segmentation_1 = require("../utilities/file-segmentation");
const partial_download_1 = require("./partial-download");
class DefaultOperation {
    constructor() {
        this.emitter = new events.EventEmitter();
    }
    start(url, contentLength, numOfConnections, headers) {
        let endCounter = 0;
        const segmentsRange = file_segmentation_1.FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        const activeDownloads = [];
        for (const segmentRange of segmentsRange) {
            const downloadInstance = new partial_download_1.PartialDownload()
                .start(url, segmentRange, headers)
                .on('error', (err) => {
                for (const activeDownload of activeDownloads) {
                    activeDownload.abort();
                }
                this.emitter.emit('error', err);
            })
                .on('data', (data, offset) => {
                this.emitter.emit('data', data, offset);
            })
                .on('end', () => {
                if (++endCounter === numOfConnections) {
                    this.emitter.emit('end', null);
                }
            });
            activeDownloads.push(downloadInstance);
        }
        return this.emitter;
    }
}
exports.DefaultOperation = DefaultOperation;
