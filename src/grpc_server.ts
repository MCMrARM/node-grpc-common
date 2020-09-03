import grpc from "grpc";
import {createJsonMethodDescription, ServiceError} from "./grpc_common";

export function createPromiseCallHandler<Req, Res>(callCallback: (call: grpc.ServerUnaryCall<Req>) => Promise<Res>) {
    return (call: grpc.ServerUnaryCall<Req>, callback: (err: grpc.ServiceError | null, res?: Res) => void) => {
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

export function registerSimpleService(grpc: grpc.Server, prefix: string, methods: {[key: string]: (call: grpc.ServerUnaryCall<any>) => Promise<any>}) {
    let def: {[key: string]: grpc.MethodDefinition<object, object>} = {};
    let impl: {[key: string]: grpc.handleCall<any, any>} = {};
    for (let k of Object.keys(methods)) {
        def[k] = createJsonMethodDescription(prefix + "/" + k);
        impl[k] = createPromiseCallHandler(methods[k]);
    }
    grpc.addService(def, methods);
}