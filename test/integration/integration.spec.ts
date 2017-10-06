import { expect } from 'chai';
import * as Promise from 'bluebird';
import * as sprequest from 'sp-request';
import { ISPRequest } from 'sp-request';
import * as pnp from 'sp-pnp-js';
import { Web } from 'sp-pnp-js';
import NodeFetchClient from './../../src/index';
import { IAuthOptions } from 'node-sp-auth';

interface ITestInfo {
    name: string;
    creds: IAuthOptions;
    url: string;
}

let config: any = require('./private.config');

let tests: ITestInfo[] = [
    {
        name: 'on-premise user credentials',
        creds: config.onpremCreds,
        url: config.onpremNtlmEnabledUrl
    },
    {
        name: 'fba on-premise user credentials',
        creds: config.onpremFbaCreds,
        url: config.onpremFbaEnabledUrl
    },
    {
        name: 'online user credentials',
        creds: config.onlineCreds,
        url: config.onlineUrl
    },
    {
        name: 'online addin only',
        creds: config.onlineAddinOnly,
        url: config.onlineUrl
    },
    {
        name: 'adfs user credentials',
        creds: config.adfsCredentials,
        url: config.onpremAdfsEnabledUrl
    }
];
let listTitle: string = 'Node-PnP-JS-Testing';

tests.forEach(test => {
    describe(`node-pnp-js: ${test.name}`, () => {
        let request: ISPRequest;
        before('Setup PnP with Node.js', function (done: any): void {
            this.timeout(30 * 1000);

            pnp.setup({
                sp: {
                    fetchClientFactory: () => {
                        return new NodeFetchClient(test.creds);
                    }
                }
            });

            request = sprequest.create(test.creds);
            done();
        });

        after('Deleting test list', function (done: MochaDone): void {
            this.timeout(30 * 1000);

            Promise.all([request.requestDigest(test.url), request.get(`${test.url}/_api/web/lists/GetByTitle('${listTitle}')`)])
                .then((data) => {
                    let digest: string = data[0];
                    let listId: string = data[1].body.d.Id;

                    return request.post(`${test.url}/_api/web/lists('${listId}')`, {
                        headers: {
                            'X-RequestDigest': digest,
                            'X-HTTP-Method': 'DELETE',
                            'IF-MATCH': '*'
                        }
                    });
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('should get web\'s title', function (done: MochaDone): void {
            this.timeout(30 * 1000);

            request.get(`${test.url}/_api/web/`)
                .then(data => {
                    return Promise.all([(new pnp.Web(test.url).get()), data.body.d.Title]);
                })
                .then(data => {
                    expect(data[0].Title).to.equal(data[1]);
                    done();
                })
                .catch(done);
        });

        it('should create a new list', function (done: MochaDone): void {
            this.timeout(30 * 1000);

            let web: Web = new pnp.Web(test.url);
            web.lists.add(listTitle, 'node-pnp-js testing list', 100)
                .then(result => {
                    return Promise.all([request.get(`${test.url}/_api/web/lists/GetByTitle('${listTitle}')`), result]);
                })
                .then(result => {
                    expect(result[0].body.d.Title).to.equal(listTitle);
                    done();
                })
                .catch(done);
        });

        it('should correctly utilize baseUrl', function (done: MochaDone): void {
            this.timeout(30 * 1000);

            pnp.setup({
                sp: {
                    baseUrl: test.url
                }
            });

            request.get(`${test.url}/_api/web/`)
                .then(data => {
                    return Promise.all([(pnp.sp.web.get()), data.body.d.Title]);
                })
                .then(data => {
                    expect(data[0].Title).to.equal(data[1]);
                    pnp.setup({
                        sp: {
                            baseUrl: test.url
                        }
                    });
                    done();
                })
                .catch(done);
        });

        it('should correctly utilize NodeFetchClient with siteUrl param', function (done: MochaDone): void {
            this.timeout(30 * 1000);

            pnp.setup({
                sp: {
                    fetchClientFactory: () => {
                        return new NodeFetchClient(test.creds, test.url);
                    }
                }
            });

            request.get(`${test.url}/_api/web/`)
                .then(data => {
                    return Promise.all([(pnp.sp.web.get()), data.body.d.Title]);
                })
                .then(data => {
                    expect(data[0].Title).to.equal(data[1]);
                    pnp.setup({
                        sp: {
                            baseUrl: undefined
                        }
                    });
                    done();
                })
                .catch(done);
        });
    });
});
