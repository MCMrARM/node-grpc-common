import grpc, {Metadata} from "@grpc/grpc-js";

export class ServiceError implements grpc.ServiceError {
    public name: string = 'ServiceError';
    details: string;
    metadata: Metadata = new Metadata();

    constructor(public code: grpc.status, public message: string) {
        this.details = message;
    }
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