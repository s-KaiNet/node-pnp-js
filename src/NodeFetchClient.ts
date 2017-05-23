import { HttpClientImpl, FetchOptions, Util } from 'sp-pnp-js';
import * as spauth from 'node-sp-auth';
import * as nodeFetch from 'node-fetch';
import { Headers } from 'node-fetch';
import fetch from 'node-fetch';
import { parse as urlParse } from 'url';
import * as https from 'https';

declare var global: any;

global.Headers = nodeFetch.Headers;
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;

export default class NodeFetchClient implements HttpClientImpl {

    constructor(private authSettngs: spauth.IAuthOptions, private siteUrl?: string) { }

    public fetch(url: string, options: FetchOptions): Promise<any> {

        if (!Util.isUrlAbsolute(url)) {
            url = Util.combinePaths(this.siteUrl, url);
        }

        return <any>spauth.getAuth(url, this.authSettngs)
            .then((data: any) => {

                /* attach headers and options received from node-sp-auth */
                const headers: Headers = new Headers();
                this.mergeHeaders(headers, options.headers);
                this.mergeHeaders(headers, data.headers);

                let host: string = (urlParse(url)).host;
                let isOnPrem: boolean = host.indexOf('.sharepoint.com') === -1 && host.indexOf('.sharepoint.cn') === -1;

                // fix - full metadata for on-premise
                if (isOnPrem) {
                    headers.set('accept', 'application/json;odata=verbose');
                }

                Util.extend(options, {
                    headers: headers
                });

                Util.extend(options, data.options);

                let isHttps: boolean = urlParse(url).protocol === 'https:';

                if (isHttps && !(<any>options).agent) {
                    /* bypassing ssl certificate errors (self signed, etc) for on-premise */
                    (<any>options).agent = new https.Agent({ rejectUnauthorized: false });
                }

                /* perform actual request with node-fetch */
                return fetch(url, <any>options);
            });
    }

    private mergeHeaders(target: Headers, source: any): void {
        if (typeof source !== 'undefined' && source !== null) {
            const temp: any = <any>new Request('', { headers: source });
            temp.headers.forEach((value: string, name: string) => {
                target.set(name, value);
            });
        }
    }
}
