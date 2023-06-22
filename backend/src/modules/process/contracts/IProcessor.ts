export default interface IProcessor {
  resize(
    readableStream: NodeJS.ReadableStream,
    largestSideSize: number,
  ): Promise<Buffer | Blob | ArrayBuffer | ArrayBufferView>

  rotate(
    readableStream: NodeJS.ReadableStream,
    angle: number,
  ): Promise<Buffer | Blob | ArrayBuffer | ArrayBufferView>
}
