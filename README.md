# PnP-JS-Core (sp-pnp-js) with Node.js made easy

[![NPM](https://nodei.co/npm/node-pnp-js.png?mini=true)](https://nodei.co/npm/node-pnp-js/)

[![npm version](https://badge.fury.io/js/node-pnp-js.svg)](https://badge.fury.io/js/node-pnp-js)

`node-pnp-js` allows you to use [`pnp-js-core`](https://github.com/SharePoint/PnP-JS-Core) from Node.js environment.   
`node-pnp-js` implements it's own version of `NodeFetchClient` (shipped with `sp-pnp-js`) which supports authentication with help of [`node-sp-auth`](https://github.com/s-KaiNet/node-sp-auth) module.  

---
## How to use  
### Install

```bash
npm install node-pnp-js --save
```

### Import fetch client and configure pnp 

```javascript
import * as pnp from 'sp-pnp-js';
import NodeFetchClient from 'node-pnp-js';

pnp.setup({
        fetchClientFactory: () => {
            return new NodeFetchClient(credentials);
        }
    });
```  

`credentials` - the same object ([`credentialOptions`](https://github.com/s-KaiNet/node-sp-auth#params)) provided for `node-sp-auth` module. That means you can use any authentication option from `node-sp-auth` you want. 

### Use PnP-JS-Core library in code:

```javascript
new pnp.Web(siteUrl)
    .then(data => {
        console.log(`Your web title: ${data.Title}`);
    })
```  

There are three different approaches you can use in order to provide your SharePoint site url. 

#### 1. Use `Web` or `Site` constructor (like in sample above) with site url param: 
```javascript
pnp.setup({
        fetchClientFactory: () => {
            return new NodeFetchClient(credentials);
        }
    });

new pnp.Web(siteUrl)
    .then(data => {
        console.log(`Your web title: ${data.Title}`);
    })
```  
#### 2. Use `baseUrl` configuration parameter (coming from `sp-pnp-js`):
```javascript
pnp.setup({
        fetchClientFactory: () => {
            return new NodeFetchClient(credentials);
        },
        baseUrl: siteUrl
    });

//now you can access your web using chaining syntax (pnp.sp.web will reference the web with url you provided as baseUrl):
pnp.sp.web.get()
    .then(data => {
        console.log(`Your web title: ${data.Title}`);
    })
```  
#### 3. Use `siteUrl` constructor param for `NodeFetchClient`:
```javascript
pnp.setup({
        fetchClientFactory: () => {
            return new NodeFetchClient(credentials, siteUrl);
        }
    });

//now you can access your web using chaining syntax (pnp.sp.web will reference the web with url you provided as siteUrl param):
pnp.sp.web.get()
    .then(data => {
        console.log(`Your web title: ${data.Title}`);
    })
```    

## Use cases:  
1. Any Node.js project with SharePoint. It can be remote jobs, azure functions, daemons
2. Build pipeline extensibility. You can easily enhance your gulp pipeline with custom actions touching SharePoint. 
3. Anything else you can do with Node.js and SharePoint :)

## Development:
I recommend using VS Code for development. Repository already contains some settings for VS Code editor.

1. `git clone https://github.com/s-KaiNet/node-pnp-js.git`
2. `npm install`
2. `npm run build` - runs typescript compilation


## Integration testing:
1. Rename file `/test/integration/private.config.sample.ts` to `private.config.ts`.
2. Update information in `private.config.ts` with appropriate values (urls, credentials).
3. Run `gulp test-int`.