import {
  FailureParsingResult,
  ParsingResult,
  SuccessParsingResult,
} from "./parsing-result"
import { isWhiteSpace } from "./utils"

export abstract class BaseParser<TResult = unknown> {
  public input: string
  public pos: number

  constructor(input: string) {
    this.input = input
    this.pos = 0
  }

  public abstract parse(): TResult

  public next(): string {
    if (this.isOver()) {
      throw new Error(`Unexpected end of input`)
    }

    return this.input.charAt(this.pos++)
  }

  public peek(): string {
    return this.isOver() ? "" : this.input.charAt(this.pos)
  }

  public isOver(): boolean {
    return this.pos >= this.input.length
  }

  public spaces(): void {
    while (isWhiteSpace(this.peek())) {
      this.next()
    }
  }

  public spaces1(): void {
    const nextChar = this.peek()

    if (!isWhiteSpace(nextChar)) {
      throw new Error(
        `Unexpected character: "${nextChar}". Expecting whitespace.`,
      )
    }

    this.next()
    this.spaces()
  }

  public matchString(target: string): void {
    for (let i = 0; i < target.length; i++) {
      const nextChar = this.peek()

      if (nextChar === "") {
        throw new Error(`Unexpected end of input`)
      }

      if (nextChar !== target[i]) {
        throw new Error(
          `Unexpected character: ${nextChar}. Expecting '${target[i]}' at position ${this.pos}`,
        )
      }

      this.next()
    }
  }

  /**
   *
   * @param times - the number of times to repeat a parsing callback
   * @param callback - the callback that implements some parsing logic
   * @returns
   */
  public repeat<T>(times: number, callback: (time: number) => T): T[] {
    const result: T[] = []

    for (let i = 0; i < times; i++) {
      result.push(callback(i))
    }

    return result
  }

  /**
   *
   * @param callback
   * @returns
   */
  public many<T>(callback: () => T): T[] {
    const results: T[] = []

    while (true) {
      const currentResult = this.optional(() => callback())

      if (currentResult.tag === "Failure") {
        break
      }

      results.push(currentResult.value)
    }

    return results
  }

  /**
   *
   * @param callback
   * @returns
   */
  public many1<T>(callback: () => T): T[] {
    const results: T[] = []

    results.push(callback())

    return results.concat(this.many(callback))
  }

  /**
   * Parse a char satisfying a condition
   * @param predicate
   * @param errorMessage
   * @returns
   */
  public sat(
    predicate: (char: string) => boolean,
    errorMessage: string,
  ): string {
    if (!predicate(this.peek())) {
      throw new Error(errorMessage)
    }

    return this.next()
  }

  /**
   *
   * @param callback
   * @returns
   */
  public optional<T>(callback: () => T): ParsingResult<T> {
    const startPos = this.pos

    try {
      return new SuccessParsingResult(callback())
    } catch (e) {
      // no error only if no consumed input
      if (this.pos === startPos) {
        return new FailureParsingResult()
      }

      throw e
    }
  }

  /**
   *
   * @param callback
   * @returns
   */
  public attempt<T>(callback: () => T): ParsingResult<T> {
    const startPos = this.pos

    try {
      return new SuccessParsingResult(callback())
    } catch (e) {
      this.pos = startPos

      return new FailureParsingResult()
    }
  }

  public applyParser<CustomResult>(parserClass: {
    new (input: string): BaseParser<CustomResult>
  }): CustomResult {
    const otherParser = new parserClass(this.input)
    otherParser.pos = this.pos

    const result = otherParser.parse()

    this.pos = otherParser.pos

    return result
  }
}
