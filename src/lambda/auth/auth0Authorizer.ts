import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-emwfo3nx.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJEkNK62dfCOFFMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1lbXdmbzNueC5hdXRoMC5jb20wHhcNMTkwODE3MTk0MTI3WhcNMzMw
NDI1MTk0MTI3WjAhMR8wHQYDVQQDExZkZXYtZW13Zm8zbnguYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jFekcXeDlPL6BIsycJ4sbva
vAOI6OdCJt1QXk9TCl1Mg6QjK1EBxzfQiandH50efGyyYyQ9K4BL30CjT2XfVkq7
aiBGtNWeVMTBeva5ulNOeCTGvcSkItsS56U6tj+1+75rHObTr+A2oAEln/EtLErP
kkaSyqXIMeH+cVM8rlBESkAZf6vuL+EokH8AN0xGtf5u3WSXfXY1S1keFl6AhFmd
TKdVxDmbcrMWyP9/scUJACAi+VVMR1oLxf6hCURL0o58gHqiPq6TZO1FVKnPWCcc
DawaOr6GKCPeMKZUr3/vxmO03jrNE0LiOXDrtsFh82+MS0o7A/GkiNyvhIlSUwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRB5/64oKJnjXsHSWpd
zteSQ04+QTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAKVlfOcE
qb11rA2upxbmiPEOwAEGsNsOS0wSo10Nd5Sv/YMXr5cRVfZ1m1SyrkxPSbhRVVkZ
tumo1j2wq1uhIe7wyr6Sx7h6R8mYuMJp3bYto7GGOakX6g77FlahVx5NQSC7uSNi
R8dsK3C/SUu7bptov+cqW8kiSfol1Cp4HTI3JErpiv1N1GcMac27KivhvCCcygbG
V1hHccnCNc0uudO1alBSIeL+ePe8oxhA5xpVx3KzzF4vHfXPdyglWBxh2j/Yqgy+
/rzsqHDFNoO5+k09hglv/Ksm1T/tTn144idBMZdhJjuddEjA/uxRNzrgDfMkoZ/q
JfaBX0jNzvq5MpA=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
