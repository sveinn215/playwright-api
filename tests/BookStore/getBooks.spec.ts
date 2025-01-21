import { test } from "@playwright/test"
import { defaultAssertion, repositories} from "../../utility.ts"

const endpoint = `${repositories.bookStore}Books`

test.describe(`get all books endpoint`, ()=>{
    test(`system should send 200 respons and return all books data`, async ({request}) => {
        var response = await request.get(endpoint)
        defaultAssertion(response,'./schema/bookSchema.json',200)
    })
})