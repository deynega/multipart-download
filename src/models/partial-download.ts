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
        let retryCount: number = 0;

        const downloadChunk = (offset: number) => {
            const options: request.CoreOptions = {};
            options.headers = headers || {};
            options.headers.Range = `${AcceptRanges.Bytes}=${offset}-${range.end}`;

            this.req = request.get(url, options)
                .on('error', (err) => {
                    this.req.abort();
                    if (retryCount < this.MAX_RETRIES) {
                        retryCount++;
                        downloadChunk(offset);
                    } else {
                        this.emit('error', `Failed to get data-chunk after ${this.MAX_RETRIES} attempts. ${err}`);
                    }
                })
                .on('data', (data) => {
                    this.emit('data', data, offset);
                    offset += data.length;
                })
                .on('end', () => {
                    this.emit('end');
                });
        };

        downloadChunk(range.start);

        return this;
    }

    public abort(): void {
        this.req.abort();
    }
}
