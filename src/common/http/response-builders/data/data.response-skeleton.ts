export class DataResponseSkeleton<T> {
  readonly statusCode: number;
  readonly message: string;
  readonly data: T;
}
