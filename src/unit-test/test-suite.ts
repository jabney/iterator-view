import { UnitTest } from './unit-test'

type TestItem = UnitTest | TestSuite

export class TestSuite {
    constructor(private readonly items: TestItem[]) {}

    async run() {
        //
    }
}
