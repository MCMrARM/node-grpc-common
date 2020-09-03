import grpc from "grpc";
import {promisify} from "util";
import {createJsonMethodDescription} from "./grpc_common";

interface ClientMethod<Req, Res> {}
type extractReq<Type> = Type extends ClientMethod<infer Req, any> ? Req : never
type extractRes<Type> = Type extends ClientMethod<any, infer Res> ? Res : never
type SimpleClient<T extends {}> = grpc.Client & {
    [P in keyof T]: (req: extractReq<T[P]>) => Promise<extractRes<T[P]>>
}

export function defineClientMethod<Req, Res>(): ClientMethod<Req, Res> {
    return {};
}

export function makeSimpleClientConstructor<T extends {[key: string]: ClientMethod<any, any>}>(prefix: string, methods: T): (new (address: string, credentials: grpc.ChannelCredentials, options?: object) => SimpleClient<T>) {
    let def: {[key: string]: grpc.MethodDefinition<object, object>} = {};
    for (let k of Object.keys(methods))
        def[k] = createJsonMethodDescription(prefix + "/" + k);
    let ret = grpc.makeGenericClientConstructor(def, prefix, {}) as any;
    for (let k of Object.keys(methods))
        ret.prototype[k] = promisify(ret.prototype[k]);
    return ret;
}

export type extractClientType<Type> = Type extends (new () => SimpleClient<infer T>) ? SimpleClient<T> : never