import {SiweMessage} from "siwe";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import {middyfy} from '@libs/lambda';
import {decodeTime} from "ulid";

const inputSchema = {
    type: "object",
    required: ['signature', 'message'],
    additionalProperties: false,
    properties: {
        signature: {
            type: "string"
        },
        message: {
            type: 'string'
        }
    }
} as const

const verify: ValidatedEventAPIGatewayProxyEvent<typeof inputSchema> = async (event) => {
    const nonce_ttl = process.env.NONCE_TTL ? Number(process.env.NONCE_TTL) * 1000 : 10000

    try {
        const siweMessage = new SiweMessage(event.body.message)
        const parsedMessage = await siweMessage.validate(event.body.signature)

        // Check if nonce has expired
        if (decodeTime(siweMessage.nonce) + nonce_ttl < Date.now()) {
            return formatJSONResponse({ok: false, message: "Expired nonce"})
        }
        // Check message was signed for the expected chain
        if (siweMessage.chainId !== 1) {
            return formatJSONResponse({ok: false, message: "Wrong chain"})
        }

        // Store the signature, add auth token or custom user info to the response, etc.
        return formatJSONResponse({ok: true, address: parsedMessage.address})
    } catch (e) {
        console.error(e)
        return formatJSONResponse({ok: false, message: "Verification error"})
    }
}

export const handler = middyfy(verify)
