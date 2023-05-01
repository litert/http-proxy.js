/**
 * Copyright 2023 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type * as Net from 'node:net';
import * as Http from 'node:http';
import * as C from './Common';

function parseOptions(optOrUrl: string | C.IServerOptions): C.IServerOptions {

    if (typeof optOrUrl === 'string') {

        const url = new URL(optOrUrl);

        if (url.protocol !== 'http:') {

            throw new TypeError('Only HTTP proxy is supported.');
        }

        if (typeof url.hostname !== 'string') {

            throw new TypeError('Invalid hostname in URL.');
        }

        const port = url.port === undefined ? 80 : parseInt(url.port);

        if (!Number.isInteger(port) || port < 0 || port > 65535) {

            throw new TypeError('Invalid port in URL.');
        }

        optOrUrl = {
            'host': url.hostname,
            'auth': url.username && url.password ? {
                'username': url.username,
                'password': url.password,
            } : null,
            'port': port,
            'connectTimeout': C.DEFAULT_TIMEOUT,
            'headers': {}
        };
    }

    if (optOrUrl.auth) {

        optOrUrl.headers = {
            ...optOrUrl.headers,
            'Proxy-Authorization': `Basic ${Buffer.from(`${optOrUrl.auth.username}:${optOrUrl.auth.password}`).toString('base64')}`
        };
    }

    return {
        'connectTimeout': C.DEFAULT_TIMEOUT,
        'port': 80,
        ...optOrUrl,
    };
}

/**
 * Create a socket that connects to target `host:port` through determined HTTP proxy server.
 *
 * > The timeout socket is set to `0` by default, you can change it manually.
 * >
 * > Except for `timeout`, all other options are the same as `node:net` module does.
 * >
 * > Besides, you should notice that `address()` does not refer to the target `host:port`, but the proxy server's `host:port`.
 *
 * @returns A normal socket provided by `node:net` module, and it is already connected to target `host:port`, though a HTTP proxy server.
 */
export function connect(options: C.IConnectOptions): Promise<Net.Socket> {

    const srvOpts = parseOptions(options.server);

    return new Promise((resolve, reject) => {

        const req = Http.request({
            'method': 'CONNECT',
            'host': srvOpts.host,
            'port': srvOpts.port,
            'path': `${options.target.host}:${options.target.port}`,
            'headers': srvOpts.headers,
            'timeout': srvOpts.connectTimeout,
        });

        req.on('connect', (res, socket) => {

            req.removeAllListeners();

            if (res.statusCode === 200) {

                socket.setTimeout(0);
                resolve(socket);
            }
            else if (res.statusCode === 407) {

                socket.destroy();
                reject(new Error(`${srvOpts.host}:${srvOpts.port} denied the authentication credentials.`));
            }
            else {

                socket.destroy();
                reject(new Error(`Failed to connect to ${srvOpts.host}:${srvOpts.port} through proxy server ${srvOpts.host}:${srvOpts.port}.`));
            }
        })
            .on('error', (e) => {

                req.removeAllListeners();
                req.socket?.destroy();
                reject(e);
            });

        req.end();
    });
}
