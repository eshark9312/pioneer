import { config } from 'dotenv'
import { isString, pick } from 'lodash'

const errMsg = (name: string) => Error(`${name} should be defined in .env`)
const parsedConfig = config().parsed ?? {}
const {
  QUERY_NODE_ENDPOINT,
  APP_SECRET_KEY,
  PIONEER_URL = 'https://pioneerapp.xyz',
  STARTING_BLOCK: _STARTING_BLOCK,
  EMAIL_SENDER,
  MAILGUN_DOMAIN,
} = parsedConfig

if (!QUERY_NODE_ENDPOINT) throw errMsg('QUERY_NODE_ENDPOINT')
if (!EMAIL_SENDER) throw errMsg('EMAIL_SENDER')

const emailProvidersConfig = ['SENDGRID_API_KEY', 'MAILGUN_CONFIG'] as const
const emailProvider = pick(parsedConfig, emailProvidersConfig)
if (Object.values(emailProvider).filter(isString).length !== 1) {
  throw errMsg(`A unique value out of: ${emailProvidersConfig.join(', ')}`)
}
if (emailProvider.MAILGUN_CONFIG && !MAILGUN_DOMAIN) throw errMsg('If MAILGUN_CONFIG is defined, MAILGUN_DOMAIN')

export { QUERY_NODE_ENDPOINT, APP_SECRET_KEY, PIONEER_URL, EMAIL_SENDER, emailProvider, MAILGUN_DOMAIN }

export const STARTING_BLOCK = Number(_STARTING_BLOCK ?? 0)