import grpc from "grpc";

export class ServiceError implements grpc.ServiceError {
    public name: string = 'ServiceError';

    constructor(public code: grpc.status, public message: string) {}
}

function serializeJson(obj: object) {
    return new Buffer(JSON.stringify(obj));
}
function deserializeJson(buffer: Buffer): object {
    return JSON.parse(buffer.toString());
}

let basicMethodDescription = {
    requestStream: false,
    responseStream: false,
    requestSerialize: serializeJson,
    requestDeserialize: deserializeJson,
    responseSerialize: serializeJson,
    responseDeserialize: deserializeJson
};
export function createJsonMethodDescription(path: string): grpc.MethodDefinition<object, object> {
    return {
        ...basicMethodDescription,
        path: path
    };
}