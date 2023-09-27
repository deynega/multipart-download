import events = require('events');
import request = require('request');

import {AcceptRanges} from './accept-ranges';

export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}

export class PartialDownload extends events.EventEmitter {
    private readonly MAX_RETRIES: number = 3;
    private req: request.Request;

    public start(url: string, range: PartialDownloadRange, headers?: request.Headers): PartialDownload {
        let retryCount = 0;
        let lastSuccessfulOffset = range.start;

        const downloadChunk = (startOffset: number) => {
            const options: request.CoreOptions = {};
            options.headers = headers || {};
            options.headers.Range = `${AcceptRanges.Bytes}=${startOffset}-${range.end}`;

            this.req = request.get(url, options)
                .on('error', (err) => {
                    if (retryCount < this.MAX_RETRIES) {
                        retryCount++;
                        downloadChunk(lastSuccessfulOffset);
                    } else {
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

    public abort(): void {
        this.req.abort();
    }
}
