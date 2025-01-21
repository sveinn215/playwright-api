import { expect, test } from "@playwright/test"
import  { defaultAssertion, accountDefaultRequestBody ,repositories } from '../../utility.ts'

const endpointUrl = `${repositories.account}User`

test.describe(`get user endpoint`,()=>{
    test(`system should return success response 200`, async ({ request })=>{
        var req = accountDefaultRequestBody
        req.userName = `automation${Date.now()}`
        var createUserResponse = await (await request.post(endpointUrl,{data: req})).text()
        var userId = JSON.parse(createUserResponse)[`userID`]

        var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: req})).text()
        var token = JSON.parse(generateTokenResponse)[`token`]

        var response = await request.get(`${endpointUrl}/${userId}`, { headers : {Authorization : `Bearer ${token}`}})
        defaultAssertion(response,'./schema/userSchema.json',200)
    })

    test(`system should return failed response 401 when get userId but not logged in`, async ({request})=>{
        var req = accountDefaultRequestBody
        req.userName = `automation${Date.now()}`
        var createUserResponse = await (await request.post(endpointUrl,{data: req})).text()
        var userId = JSON.parse(createUserResponse)[`userID`]

        var response = await request.get(`${endpointUrl}/${userId}`)
        defaultAssertion(response,'',401)

        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1200',
            message: 'User not authorized!'
        }))
    })

    test(`system should return failed response 401 when send unregistered userId`, async ({ request })=>{
        var userId =  `7e30b53a-4cab-4ce3-ad8d-c1f9cf52c7cc`

        var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: accountDefaultRequestBody})).text()
        var token = JSON.parse(generateTokenResponse)[`token`]

        var response = await request.get(`${endpointUrl}/${userId}`, { headers : {Authorization : `Bearer ${token}`}})
        defaultAssertion(response,'',401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1207',
            message: 'User not found!'
        }))
    })

    test(`system should return failed response 401 when send userId using other person token`, async ({ request })=>{
        var userId =  `c9c36bac-d754-4634-ab5d-0f5850f4570c`

        var generateTokenResponse = await (await request.post(`${repositories.account}GenerateToken`,{data: accountDefaultRequestBody})).text()
        var token = JSON.parse(generateTokenResponse)[`token`]

        var response = await request.get(`${endpointUrl}/${userId}`, { headers : {Authorization : `Bearer ${token}`}})
        defaultAssertion(response,'',401)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1200',
            message: 'User not authorized!'
        }))
    })

})