import { expect, test } from "@playwright/test"
import { addBooksToUserListDefaultRequestBody,accountDefaultRequestBody ,defaultAssertion, repositories} from "../../utility.ts"

const endpoint = `${repositories.bookStore}Books`
var token = '', isbn=''

const defaultRequestBody = {
    userId : '36734f31-8aa7-468d-8fc4-24249d522757',
    isbn : '9781593275846'
}

test.beforeEach(async ({request})=>{
    var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: accountDefaultRequestBody})).text()
    token = `Bearer ${JSON.parse(generateTokenResponse)[`token`]}`
    
    await request.delete(`${endpoint}?UserId=${addBooksToUserListDefaultRequestBody.userId}`, {headers: {Authorization : token}})
    await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})

    var getAllBooksResponse = await (await request.get(endpoint, {headers: {Authorization : token}})).text()
    isbn = JSON.parse(getAllBooksResponse)[`books`][0][`isbn`]
})

test.describe(`update isbn of a book endpoint`, ()=>{
    test(`system should send 200 respons and return the updated book's data`, async ({request}) => {
        var response = await request.put(`${endpoint}/${isbn}`, {data:defaultRequestBody,headers : {Authorization : token}})
        defaultAssertion(response,'./schema/bookSchema.json',200)
        var currentIsbn = JSON.parse(await response.text())[`books`][0][`isbn`]
        expect(currentIsbn).toEqual(defaultRequestBody.isbn)
    })

    test(`system should send 401 respons when update isbn without header`, async ({request}) => {
        var response = await request.put(`${endpoint}/${isbn}`, {data:defaultRequestBody})
        defaultAssertion(response,'',401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1200',
            message: 'User not authorized!'
        }))
    })

    test(`system should send 404 respons when update isbn without isbn path`, async ({request}) => {
        var response = await request.put(`${endpoint}`, {data:defaultRequestBody,headers : {Authorization : token}})
        defaultAssertion(response,'',404)
    })

    test(`system should send 400 respons when update isbn without isbn body`, async ({request}) => {
        defaultRequestBody.isbn = ''
        var response = await request.put(`${endpoint}/${isbn}`, {data:defaultRequestBody,headers : {Authorization : token}})
        defaultAssertion(response,'',400)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1207',
            message: 'Request Body is Invalid!'
        }))
    })

    test(`system should send 400 respons when update isbn without userId body`, async ({request}) => {
        defaultRequestBody.userId = ''
        var response = await request.put(`${endpoint}/${isbn}`, {data:defaultRequestBody,headers : {Authorization : token}})
        defaultAssertion(response,'',400)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1207',
            message: 'Request Body is Invalid!'
        }))
    })
})

test.afterEach(async ({request}) => {
    defaultRequestBody.isbn = isbn
    await request.put(`${endpoint}/${isbn}`, {data:defaultRequestBody, headers: {Authorization : token}})
})