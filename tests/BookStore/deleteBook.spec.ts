import { expect,test } from "@playwright/test"
import { accountDefaultRequestBody, addBooksToUserListDefaultRequestBody,defaultAssertion, repositories} from "../../utility.ts"

const endpoint = `${repositories.bookStore}Book`

var token=''

const defaultRequest = {
    isbn: '9781449325862',
    userId: '36734f31-8aa7-468d-8fc4-24249d522757'
}

test.beforeEach(async ({request})=>{
    var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: accountDefaultRequestBody})).text()
    token = `Bearer ${JSON.parse(generateTokenResponse)[`token`]}`
    await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
})

test.describe(`delete book endpoint`, ()=>{
    test(`system should send 204 respons books with given isbn that found on the user list`, async ({request}) => {
        var response = await request.delete(`${endpoint}`, { data:defaultRequest ,headers : { Authorization: token }})
        defaultAssertion(response,'',204)
    })

    test(`system should send 400 respons books with given isbn that not found on the user list`, async ({request}) => {
        defaultRequest.isbn='1234567890'
        var response = await request.delete(`${endpoint}`, { data:defaultRequest ,headers : { Authorization: token }})
        defaultAssertion(response,'',400)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1206',
            message: "ISBN already present in the User's Collection!"
        }))
    })

    test(`system should send 401 response books with userId null`, async ({request}) => {
        var req = { userId: null, isbn: '9781449325862' }
        var response = await request.delete(`${endpoint}`, { data:req ,headers : { Authorization: token }})
        defaultAssertion(response,'', 401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1207',
            message: 'User Id not correct!'
        }))
    })

    test(`system should send 400 response books with isbn null`, async ({request}) => {
        var req = { userId: '36734f31-8aa7-468d-8fc4-24249d522757', isbn: null }
        var response = await request.delete(`${endpoint}`, { data:req ,headers : { Authorization: token }})
        defaultAssertion(response,'', 400)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1206',
            message: "ISBN supplied is not available in User's Collection!"
        }))
    })

    test(`system should send 502 respons books without body`, async ({request}) => {
        var response = await request.delete(`${endpoint}`,{ headers : { Authorization: token }})
        defaultAssertion(response,'',502)
    })

    test(`system should send 401 respons books without token`, async ({request}) => {
        var response = await request.delete(`${endpoint}`)
        defaultAssertion(response,'',401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1200',
            message: 'User not authorized!'
        }))
    })

})