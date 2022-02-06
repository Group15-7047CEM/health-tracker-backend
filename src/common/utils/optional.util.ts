export class Optional<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isPresent(): boolean {
    return this.value !== undefined && this.value !== null;
  }

  get(): T {
    return this.value;
  }
}
