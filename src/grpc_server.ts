import grpc, {ServerErrorResponse, ServerUnaryCall} from "@grpc/grpc-js";
import {createJsonMethodDescription, ServiceError} from "./grpc_common.js";

export type ServerCall<Req> = ServerUnaryCall<Req, any>;

export function createPromiseCallHandler<Req, Res>(callCallback: (call: grpc.ServerUnaryCall<Req, Res>) => Promise<Res>) {
    return (call: grpc.ServerUnaryCall<Req, Res>, callback: (err: ServerErrorResponse | null, res?: Res) => void) => {
        callCallback(call)
            .then((x) => callback(null, x))
            .catch((x) => {
                if (x instanceof Error)
                    callback(x);
                else
                    callback(new ServiceError(grpc.status.INTERNAL, "Invalid error thrown"));
            })
    };
}

export function registerSimpleService(grpc: grpc.Server, prefix: string, methods: {[key: string]: (call: grpc.ServerUnaryCall<any, any>) => Promise<any>}) {
    let def: {[key: string]: grpc.MethodDefinition<object, object>} = {};
    let impl: {[key: string]: grpc.handleUnaryCall<any, any>} = {};
    for (let k of Object.keys(methods)) {
        def[k] = createJsonMethodDescription(prefix + "/" + k);
        impl[k] = createPromiseCallHandler(methods[k]);
    }
    grpc.addService(def, impl);
}