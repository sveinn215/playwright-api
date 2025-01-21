import { test } from "@playwright/test"
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

const endpointUrl = `${repositories.account}Authorized`
test.describe(`authorized endpoint`,()=>{
    test(`system should return success response 200`, async ({ request })=>{
        var response = await request.post(endpointUrl,{data: accountDefaultRequestBody})
        defaultAssertion(response,'',200)
    })

    test(`system should return failed response 404 when send unregistered username`, async ({ request })=>{
        var req = accountDefaultRequestBody
        req.userName = `randomize`
        var response = await request.post(endpointUrl,{data: req})
        defaultAssertion(response,'',404)
    })

    Object.keys(badRequestCase).forEach(key => {
        test(`system should return failed response 400 when send ${key}`, async ({ request })=>{
            var response = await request.post(endpointUrl,{data: badRequestCase[key]})
            defaultAssertion(response,'',400)
        })
    })
})