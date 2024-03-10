// import { } from '../src/iterator-view'
// import { TestRunner as Runner } from './test-runner'
// import { TestSuite as Suite } from './test-suite'
// import { UnitTest as T } from './unit-test'

// Runner.run('Array View Tests', [
//     /**
//      *
//      */
//     Suite.test('Array View Core', [
//         T.test('View Creation', t => {
//             const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//             const view = arrayView(array)
//             t.equals(array.length, view.length, 'array and view length are the same')
//         }),
//         T.skip('View Bounds from start', t => {
//             const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
//             const view = arrayView(array, 1)
//             t.equals(array.length - 1, view.length, 'view length is 1 less than array length')
//             t.equals('b', view[0], "first element is 'b'")
//             t.equals('j', view[view.length - 1], "last element is 'j'")
//         }),
//         T.test('View Bounds from start and end', t => {
//             const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
//             const view = arrayView(array, 1, -1)
//             t.equals(array.length - 2, view.length, 'view length is 2 less than array length')
//             t.equals('b', view[0], "first element is 'b'")
//             t.equals('x', view[view.length - 1], "last element is 'i'")
//         }),
//     ]),

//     /**
//      *
//      */
//     Suite.test('Array View Methods', [
//         T.test('Slice from start', t => {
//             const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

//             const a = arrayView(array)
//             t.equals(array.length, a.length, 'array and view length are the same')

//             const b = a.slice(0)
//             t.equals(a.length, b.length, 'views a and b are same length')

//             const c = b.slice(1)
//             t.equals(b.length - 1, c.length, 'view c is 1 less than view b')
//             t.equals('b', c[0], 'first element of view b was trimmed')
//             t.equals('j', c[c.length - 1], ' cend element is unchanged')

//             const d = c.slice(1)
//             t.equals(c.length - 1, d.length, 'view d is 1 less than view c')
//             t.equals('c', d[0], 'd first element was trimmed')
//             t.equals('j', d[d.length - 1], 'end element is unchanged')
//         }),
//         T.test('Slice from end', t => {
//             const array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

//             const a = arrayView(array)
//             t.equals(array.length, a.length, 'view and array are same length')

//             const b = a.slice(0, a.length)
//             t.equals(a.length, b.length, 'views a and b are same length')

//             const c = b.slice(1, -1)
//             t.equals(b.length - 2, c.length, 'view c is 2 less than view b')
//             t.equals('b', c[0], 'first element of view b was trimmed')
//             t.equals('i', c[c.length - 1], 'end element of view b was trimmed')

//             const d = c.slice(1, -1)
//             t.equals(c.length - 2, d.length, 'view d is 2 less than view c')
//             t.equals('c', d[0], 'first element of view c was trimmed')
//             t.equals('h', d[d.length - 1], 'end element of view c was trimmed')
//         }),
//     ]),
// ])
