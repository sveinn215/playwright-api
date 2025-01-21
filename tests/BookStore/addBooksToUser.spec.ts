import { expect, test } from "@playwright/test"
import { accountDefaultRequestBody, addBooksToUserListDefaultRequestBody ,defaultAssertion, repositories} from "../../utility.ts"

var token = ''
const endpoint = `${repositories.bookStore}Books`

test.beforeEach(async ({request})=>{
    var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: accountDefaultRequestBody})).text()
    token = `Bearer ${JSON.parse(generateTokenResponse)[`token`]}`
})

test.describe(`add books to user list`, ()=>{
    test(`system should send 204 when user succeed add book to their lists`, async ({request}) => {
        
        await request.delete(`${endpoint}?UserId=${addBooksToUserListDefaultRequestBody.userId}`, {headers: {Authorization : token}})
        var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
        defaultAssertion(response,'',201)
    })

    test(`system should send 201 when user succeed add multiple book to their lists`, async ({request}) => {
        
      await request.delete(`${endpoint}?UserId=${addBooksToUserListDefaultRequestBody.userId}`, {headers: {Authorization : token}})
      
      addBooksToUserListDefaultRequestBody.collectionOfIsbns.push({isbn:'9781449331818'})
      var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
      defaultAssertion(response,'',201)
      expect(await response.json()).toEqual(expect.objectContaining({ 
          books: [ 
            { isbn: '9781449325862' }, 
            { isbn: '9781449331818' } 
          ] 
        }))
     })

    test(`system should send 400 when adding book that already on the list`, async ({request}) => {
        
      await request.delete(`${endpoint}?UserId=${addBooksToUserListDefaultRequestBody.userId}`, {headers: {Authorization : token}})
      await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
      var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
      defaultAssertion(response,'',400)
      expect(await response.json()).toEqual(expect.objectContaining({
        code: '1210',
        message: "ISBN already present in the User's Collection!"
      }))
    })

    test(`system should send 400 when adding book that not found on database`, async ({request}) => {
      addBooksToUserListDefaultRequestBody.collectionOfIsbns[0].isbn = `1234567890`
      var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
      defaultAssertion(response,'',400)
      expect(await response.json()).toEqual(expect.objectContaining({
        code: '1205',
        message: "ISBN supplied is not available in Books Collection!"
      }))
    })

    test(`system should send 400 when adding book but the isbn is null`, async ({request}) => {
      addBooksToUserListDefaultRequestBody.collectionOfIsbns=[]
      var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
      defaultAssertion(response,'',400)
      expect(await response.json()).toEqual(expect.objectContaining({
        code: '1207',
        message: 'Collection of books required.'
      }))
    })

    test(`system should send 401 when adding book but the user is not found on database`, async ({request}) => {
      addBooksToUserListDefaultRequestBody.userId=`6f3e4ed1-dba0-4184-a285-dd8ec14d426e`
      var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody, headers: {Authorization : token}})
      defaultAssertion(response,'',401)
      expect(await response.json()).toEqual(expect.objectContaining({
        code: '1207',
        message: "User Id not correct!"
      }))
    })

    test(`system should send 502 when adding book but the user is null`, async ({request}) => {
      var req = {collectionOfIsbns: [
        {
          isbn: '9781449325862'
        }
      ]}

      var response = await request.post(endpoint,{data:req, headers: {Authorization : token}})
      defaultAssertion(response,'',502)
    })

    test(`system should send 401 when adding book but the user without access token`, async ({request}) => {
      var response = await request.post(endpoint,{data:addBooksToUserListDefaultRequestBody})
      defaultAssertion(response,'',401)
      expect(await response.json()).toEqual(expect.objectContaining({
        code: '1200',
        message: "User not authorized!"
      }))
    })

})