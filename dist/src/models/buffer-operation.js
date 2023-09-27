"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferOperation = void 0;
const events = require("events");
const file_segmentation_1 = require("../utilities/file-segmentation");
const partial_download_1 = require("./partial-download");
class BufferOperation {
    constructor() {
        this.emitter = new events.EventEmitter();
    }
    start(url, contentLength, numOfConnections, headers) {
        const buffer = Buffer.allocUnsafe(contentLength);
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
                data.copy(buffer, offset);
            })
                .on('end', () => {
                if (++endCounter === numOfConnections) {
                    this.emitter.emit('end', buffer);
                }
            });
            activeDownloads.push(downloadInstance);
        }
        return this.emitter;
    }
}
exports.BufferOperation = BufferOperation;
