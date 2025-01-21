import { APIResponse, expect } from "@playwright/test"
import Ajv from "ajv"

const successOkCode = 200
const successCreatedCode = 201
const errorServerCode = 500
const errorBadRequestCode = 400
const errorUnauthorizedCode = 401
const errorForbiddenCode = 403
const successOkMessage = 'OK'
const successCreatedMessage = 'Created'
const successAcceptedMessage = 'Accepted'
const errorBadRequestMessage = 'Bad Request'
const errorUnauthorizedMessage = 'Unauthorized'
const errorForbiddenMessage = 'Forbidden'
const errorNotFoundMessage = 'Not Found'
const errorInternalServerMessage = 'Internal Server Error'

export const defaultAssertion = async (response: APIResponse,schema : string,code: number) => {
    expect(response.status()).toEqual(code)
    switch(code){
        case 200:
            expect(response.statusText()).toEqual(successOkMessage)
            break
        case 201:
            expect(response.statusText()).toEqual(successCreatedMessage)
            break
        case 202:
            expect(response.statusText()).toEqual(successAcceptedMessage)
            break
        case 400:
            expect(response.statusText()).toEqual(errorBadRequestMessage)
            break
        case 401:
            expect(response.statusText()).toEqual(errorUnauthorizedMessage)
            break
        case 403:
            expect(response.statusText()).toEqual(errorForbiddenMessage)
            break
        case 404:
            expect(response.statusText()).toEqual(errorNotFoundMessage)
            break
        case 500:
            expect(response.statusText()).toEqual(errorInternalServerMessage)
            break
        default:
            break
    }
    if(code != 204 && code < 500){
        console.log(`===response===`)
        console.log(await response.text())
        console.log(`==============`)
    }
    if(schema !== ''){
        var jsonSchemaValidator = new Ajv()
        var validationResult = jsonSchemaValidator.validate(require(schema),JSON.parse(await response.text()))
        expect(validationResult).toEqual(true)
    }
}

export const repositories = {
    account : `Account/v1/`,
    bookStore : `BookStore/v1/`
}

export const accountDefaultRequestBody = {
    userName: `admin`,
    password: `Admin1234#`
}

export const addBooksToUserListDefaultRequestBody = {
    userId: '36734f31-8aa7-468d-8fc4-24249d522757',
    collectionOfIsbns: [
      {
        isbn: '9781449325862'
      }
    ]
}