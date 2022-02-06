export class FCUTil<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isNew(): boolean {
    return this.value[1];
  }

  get(): T {
    return this.value[0];
  }
}
