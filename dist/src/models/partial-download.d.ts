/// <reference types="node" />
import events = require('events');
import request = require('request');
export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}
export declare class PartialDownload extends events.EventEmitter {
    private readonly MAX_RETRIES;
    private req;
    start(url: string, range: PartialDownloadRange, headers?: request.Headers): PartialDownload;
    abort(): void;
}
