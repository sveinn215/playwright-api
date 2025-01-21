import { expect, test } from "@playwright/test"
import  { defaultAssertion, accountDefaultRequestBody ,repositories } from '../../utility.ts'

const badRequestCase = {
    nullUserName : {
        userName: null,
        password: `admin1234#`
    },
    nullPassword : {
        userName: `admin`,
        password: null
    },
    emptyUserName : {
        userName: ``,
        password: `admin1234#`
    },
    emptyPassword : {
        userName: `admin`,
        password: ``
    }
}

const endpointUrl = `${repositories.account}GenerateToken`
test.describe(`generate token endpoint`,()=>{
    test(`system should return success response 200`, async ({ request })=>{
        var response = await request.post(endpointUrl,{data: accountDefaultRequestBody})
        defaultAssertion(response,'./schema/generateTokenSchema.json',200)
    })

    test(`system should return failed response 200 when send unregistered username but no token returned`, async ({ request })=>{
        var req = accountDefaultRequestBody
        req.userName = `random${Date.now()}`
        var response = await request.post(endpointUrl,{data: req})
        defaultAssertion(response,'',200)
        expect(await response.json()).toEqual(expect.objectContaining({
            token: null,
            expires: null,
            status: 'Failed',
            result: 'User authorization failed.'
        }))
    })

    Object.keys(badRequestCase).forEach(key => {
        test(`system should return failed response 400 when send ${key}`, async ({ request })=>{
            var response = await request.post(endpointUrl,{data: badRequestCase[key]})
            defaultAssertion(response,'',400)
            expect(await response.json()).toEqual(expect.objectContaining({
                code: '1200',
                message: 'UserName and Password required.'
            }))
        })
    })
})