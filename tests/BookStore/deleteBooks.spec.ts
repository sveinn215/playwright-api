import { expect, test } from "@playwright/test"
import { accountDefaultRequestBody,defaultAssertion, repositories} from "../../utility.ts"

const endpoint = `${repositories.bookStore}Books`

const userId = '36734f31-8aa7-468d-8fc4-24249d522757'

var token = ''

test.beforeEach(async ({request})=>{
    var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: accountDefaultRequestBody})).text()
    token = `Bearer ${JSON.parse(generateTokenResponse)[`token`]}`
})

test.describe(`delete all books listed on user endpoint`, ()=>{
    test(`system should send 204 respons while succeed delete all books listed on the user`, async ({request}) => {
        var response = await request.delete(`${endpoint}?UserId=${userId}`, {headers : { Authorization : token }})
        defaultAssertion(response,'',204)
    })

    test(`system should send 401 respons while delete all books data using wrong userId`, async ({request}) => {
        var response = await request.delete(`${endpoint}?UserId=0a540ae4-cb63-4871-a811-a39de38616d2`, {headers : { Authorization : token }})
        defaultAssertion(response,'',401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1207',
            message: 'User Id not correct!'
        }))
    })

    test(`system should send 401 respons while succeed delete all without valid token`, async ({request}) => {
        var response = await request.delete(`${endpoint}?UserId=${userId}`)
        defaultAssertion(response,'',401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1200',
            message: 'User not authorized!'
        }))
    })

    test(`system should send 502 respons books without userId param`, async ({request}) => {
            var response = await request.delete(`${endpoint}`,{ headers : { Authorization: token }})
            defaultAssertion(response,'',401)
            expect(await response.json()).toEqual(expect.objectContaining({
                code: '1207',
                message: 'User Id not correct!'
            }))
    })
})