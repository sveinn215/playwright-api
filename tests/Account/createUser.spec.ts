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

const wrongFormatPassword = {
    noNumerical: 'abcdefg#',
    noAlphabetical: '1234567&',
    noSpecialCharacter: 'abcd1234',
    lessThanEight: 'abc1234#',
    twoSpecialCharacter: 'abc1234#$',
    withSpace: 'abcd 123$'
}

const endpointUrl = `${repositories.account}User`
test.describe(`create user endpoint`,()=>{
    test(`system should return success response 201`, async ({ request })=>{
        accountDefaultRequestBody.userName = `automation${Date.now()}`
        var response = await request.post(endpointUrl,{data: accountDefaultRequestBody})
        defaultAssertion(response,'./schema/userSchema.json',201)
    })

    test(`system should return failed response 406 when send registered username`, async ({ request })=>{
        var response = await request.post(endpointUrl,{data: accountDefaultRequestBody})
        defaultAssertion(response,'',406)
        expect(await response.json()).toEqual(expect.objectContaining({
            code: '1204', 
            message: 'User exists!'
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

    Object.keys(wrongFormatPassword).forEach(key => {
        test(`system should return failed response 400 when send password with format ${key}`, async ({ request })=>{
            var req = accountDefaultRequestBody
            req.password = wrongFormatPassword[key]
            var response = await request.post(endpointUrl,{data: req})
            defaultAssertion(response,'',400)
            expect(await response.json()).toEqual(expect.objectContaining({
                code: '1300',
                message: "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer."
            }))
        })
    })
})