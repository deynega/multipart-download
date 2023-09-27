/// <reference types="node" />
import events = require('events');
import { StartOptions } from './start-options';
export interface MultipartOperation {
    start(url: string, options?: StartOptions): MultipartOperation;
}
export declare class MultipartDownload extends events.EventEmitter implements MultipartOperation {
    private static readonly SINGLE_CONNECTION;
    start(url: string, options?: StartOptions): MultipartDownload;
    private execute;
    private validateInputs;
    private validateMetadata;
}
