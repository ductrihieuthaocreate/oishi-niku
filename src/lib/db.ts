import { neon } from '@neondatabase/serverless'

type NeonSql = ReturnType<typeof neon>

let _instance: NeonSql | undefined

function getInstance(): NeonSql {
  return (_instance ??= neon(process.env.DATABASE_URL!))
}

function taggedSql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getInstance()(strings as any, ...values)
}

taggedSql.query = function (queryText: string, queryParams?: unknown[]) {
  return (getInstance() as any).query(queryText, queryParams)
}

export const sql = taggedSql as unknown as NeonSql
