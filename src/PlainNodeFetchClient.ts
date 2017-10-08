import { HttpClientImpl, FetchOptions, Util } from 'sp-pnp-js';
import * as nodeFetch from 'node-fetch';
import fetch from 'node-fetch';

declare var global: any;

global.Headers = nodeFetch.Headers;
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;

export class PlainNodeFetchClient implements HttpClientImpl {

    constructor(private siteUrl?: string) { }

    public fetch(url: string, options: FetchOptions): Promise<any> {

        if (!Util.isUrlAbsolute(url)) {
            url = Util.combinePaths(this.siteUrl, url);
        }

        return fetch(url, <any>options);
    }
}
