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

import type * as Http from 'node:http';

/**
 * The default timeout for sockets.
 */
export const DEFAULT_TIMEOUT = 30_000;

export interface IClientAuthOptions {

    /**
     * The username to authenticate with the HTTP proxy server.
     */
    username: string;

    /**
     * The password to authenticate with the HTTP proxy server.
     */
    password: string;
}

export interface IServerOptions {

    /**
     * The hostname of the HTTP proxy server.
     */
    host: string;

    /**
     * The port of the HTTP proxy server.
     *
     * @default 80
     */
    port?: number;

    /**
     * The timeout during connecting to the HTTP proxy server.
     *
     * @default 30000
     */
    connectTimeout?: number;

    /**
     * The optional authentication options of the HTTP proxy server.
     *
     * @default null
     */
    auth?: IClientAuthOptions | null;

    /**
     * Customized headers to be sent to the remote server.
     */
    headers?: Http.OutgoingHttpHeaders;
}

export interface IConnectOptions {

    /**
     * The HTTP proxy server to be connected.
     *
     * > If a string is provided, it will be parsed as a URL, without customized timeout supports.
     */
    server: IServerOptions | string;

    /**
     * The target host to be connected through proxy server.
     */
    target: {

        /**
         * The hostname of target host to be connected through remote HTTP proxy server.
         */
        host: string;

        /**
         * The port of destination host to be connected through remote HTTP proxy server.
         */
        port: number;
    };
}
