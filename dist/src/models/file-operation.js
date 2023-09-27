"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileOperation = void 0;
const events = require("events");
const fs = require("fs");
const file_segmentation_1 = require("../utilities/file-segmentation");
const path_formatter_1 = require("../utilities/path-formatter");
const url_parser_1 = require("../utilities/url-parser");
const partial_download_1 = require("./partial-download");
class FileOperation {
    constructor(saveDirectory, fileName) {
        this.saveDirectory = saveDirectory;
        this.fileName = fileName;
        this.emitter = new events.EventEmitter();
    }
    start(url, contentLength, numOfConnections, headers) {
        const file = this.fileName ? this.fileName : url_parser_1.UrlParser.getFilename(url);
        const filePath = path_formatter_1.PathFormatter.format(this.saveDirectory, file);
        let endCounter = 0;
        fs.open(filePath, 'w+', 0o644, (err, fd) => {
            if (err) {
                this.emitter.emit('error', err);
                return;
            }
            const segmentsRange = file_segmentation_1.FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
            const activeDownloads = [];
            for (const segmentRange of segmentsRange) {
                const downloadInstance = new partial_download_1.PartialDownload()
                    .start(url, segmentRange, headers)
                    .on('error', (error) => {
                    for (const activeDownload of activeDownloads) {
                        activeDownload.abort();
                    }
                    this.emitter.emit('error', error);
                })
                    .on('data', (data, offset) => {
                    fs.write(fd, data, 0, data.length, offset, (error) => {
                        if (error) {
                            this.emitter.emit('error', error);
                        }
                        else {
                            this.emitter.emit('data', data, offset);
                        }
                    });
                })
                    .on('end', () => {
                    if (++endCounter === numOfConnections) {
                        fs.close(fd, (error) => {
                            if (error) {
                                this.emitter.emit('error', error);
                            }
                            else {
                                this.emitter.emit('end', filePath);
                            }
                        });
                    }
                });
                activeDownloads.push(downloadInstance);
            }
        });
        return this.emitter;
    }
}
exports.FileOperation = FileOperation;
