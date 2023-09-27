/// <reference types="node" />
import events = require('events');
import request = require('request');
import { Operation } from './operation';
export declare class FileOperation implements Operation {
    private saveDirectory;
    private fileName?;
    private readonly emitter;
    constructor(saveDirectory: string, fileName?: string);
    start(url: string, contentLength: number, numOfConnections: number, headers?: request.Headers): events.EventEmitter;
}
