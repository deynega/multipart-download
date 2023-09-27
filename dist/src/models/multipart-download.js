"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipartDownload = void 0;
const events = require("events");
const validation_1 = require("../utilities/validation");
const accept_ranges_1 = require("./accept-ranges");
const operation_factory_1 = require("./operation-factory");
const partial_request_query_1 = require("./partial-request-query");
class MultipartDownload extends events.EventEmitter {
    start(url, options = { numOfConnections: MultipartDownload.SINGLE_CONNECTION }) {
        options.numOfConnections = options.numOfConnections || MultipartDownload.SINGLE_CONNECTION;
        const validationError = this.validateInputs(url, options);
        if (validationError) {
            this.emit('error', validationError);
        }
        this.execute(url, options);
        return this;
    }
    execute(url, options) {
        new partial_request_query_1.PartialRequestQuery()
            .getMetadata(url, options.headers)
            .then((metadata) => {
            const metadataError = this.validateMetadata(url, metadata);
            if (metadataError) {
                this.emit('error', metadataError);
            }
            if (metadata.acceptRanges !== accept_ranges_1.AcceptRanges.Bytes) {
                options.numOfConnections = MultipartDownload.SINGLE_CONNECTION;
            }
            const operation = operation_factory_1.OperationFactory.getOperation(options);
            operation
                .start(url, metadata.contentLength, options.numOfConnections, options.headers)
                .on('error', (err) => {
                this.emit('error', err);
            })
                .on('data', (data, offset) => {
                this.emit('data', data, offset);
            })
                .on('end', (output) => {
                this.emit('end', output);
            });
        })
            .catch((err) => {
            this.emit('error', err);
        });
    }
    validateInputs(url, options) {
        if (!validation_1.Validation.isUrl(url)) {
            return new Error('Invalid URL provided');
        }
        if (!validation_1.Validation.isValidNumberOfConnections(options.numOfConnections)) {
            return new Error('Invalid number of connections provided');
        }
        if (options.saveDirectory && !validation_1.Validation.isDirectory(options.saveDirectory)) {
            return new Error('Invalid save directory provided');
        }
        if (options.fileName && !validation_1.Validation.isValidFileName(options.fileName)) {
            return new Error('Invalid file name provided');
        }
        return null;
    }
    validateMetadata(url, metadata) {
        if (isNaN(metadata.contentLength)) {
            return new Error(`Failed to query Content-Length of ${url}`);
        }
        return null;
    }
}
exports.MultipartDownload = MultipartDownload;
MultipartDownload.SINGLE_CONNECTION = 1;
