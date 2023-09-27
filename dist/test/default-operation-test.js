"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_config_1 = require("./test-config");
const default_operation_1 = require("../src/models/default-operation");
describe('Default operation', () => {
    it('single connection download', (done) => {
        const numOfConnections = 1;
        let fileContentLengthCounter = 0;
        new default_operation_1.DefaultOperation()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', () => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            done();
        });
    }).timeout(test_config_1.TestConfig.Timeout);
    it('multi connection download', (done) => {
        const numOfConnections = 5;
        let fileContentLengthCounter = 0;
        new default_operation_1.DefaultOperation()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', () => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            done();
        });
    }).timeout(test_config_1.TestConfig.Timeout);
});
