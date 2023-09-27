import events = require('events');
import request = require('request');

import {FileSegmentation} from '../utilities/file-segmentation';

import {Operation} from './operation';
import {PartialDownload, PartialDownloadRange} from './partial-download';

export class DefaultOperation implements Operation {

    private readonly emitter: events.EventEmitter = new events.EventEmitter();

    public start(url: string, contentLength: number, numOfConnections: number, headers?: request.Headers): events.EventEmitter {
        let endCounter: number = 0;

        const segmentsRange: PartialDownloadRange[] = FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        const activeDownloads: PartialDownload[] = [];

        for (const segmentRange of segmentsRange) {
            const downloadInstance = new PartialDownload()
                .start(url, segmentRange, headers)
                .on('downloadError', (err) => {
                    for (const activeDownload of activeDownloads) {
                        activeDownload.abort();
                    }
                    this.emitter.emit('downloadError', `Failed to download chunk range ${segmentRange.start}-${segmentRange.end}. Aborting all downloads. Error: ${err}`);
                })
                .on('error', (err) => {
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
