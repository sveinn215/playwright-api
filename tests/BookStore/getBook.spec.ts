import { expect,test } from "@playwright/test"
import { defaultAssertion, repositories} from "../../utility.ts"

const endpoint = `${repositories.bookStore}Book`

const errorTestCase = {
    unregisteredIsbn : '123456906934',
    emptyIsbn : null
}

test.describe(`get all books endpoint`, ()=>{
    test(`system should send 200 respons books with given isbn that registered on the database`, async ({request}) => {
        var isbn = `9781449325862`
        var response = await request.get(`${endpoint}?ISBN=${isbn}`)
        defaultAssertion(response,'./schema/bookSchema.json',200)
    })

    Object.keys(errorTestCase).forEach(key => {
        test(`system should send 400 respons books when get book with ${key}`, async ({request}) => {
            var response = await request.get(`${endpoint}?ISBN=${errorTestCase[key]}`)
            defaultAssertion(response,'',400)
            expect(await response.json()).toEqual(expect.objectContaining({
                code: '1205',
                message: 'ISBN supplied is not available in Books Collection!'
            }))
        })
    })

    test(`system should send 502 respons books without send ISBN`, async ({request}) => {
        var response = await request.get(`${endpoint}`)
        defaultAssertion(response,'',502)
    })

})