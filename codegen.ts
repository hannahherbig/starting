import { CodegenConfig } from '@graphql-codegen/cli'
import { ENDPOINT, HEADERS } from './config'

const config: CodegenConfig = {
  schema: {
    [ENDPOINT]: {
      headers: HEADERS,
    },
  },
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
    },
  },
  ignoreNoDocuments: true,
}

export default config
