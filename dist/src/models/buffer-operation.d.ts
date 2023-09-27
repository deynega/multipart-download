/// <reference types="node" />
import events = require('events');
import request = require('request');
import { Operation } from './operation';
export declare class BufferOperation implements Operation {
    private readonly emitter;
    start(url: string, contentLength: number, numOfConnections: number, headers?: request.Headers): events.EventEmitter;
}
