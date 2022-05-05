import {middyfy} from '@libs/lambda';
import {ulid} from "ulid";


const nonce = async () => ({
    statusCode: 200,
    body: ulid()
})

export const handler = middyfy(nonce)
