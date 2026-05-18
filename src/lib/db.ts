import { neon } from '@neondatabase/serverless'

type NeonSql = ReturnType<typeof neon>

let _sql: NeonSql | undefined

function getInstance(): NeonSql {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!)
  return _sql
}

export const sql = new Proxy(function () {} as unknown as NeonSql, {
  apply(_target, thisArg, args) {
    return Reflect.apply(getInstance() as unknown as () => unknown, thisArg, args)
  },
  get(_target, prop) {
    return (getInstance() as unknown as Record<string, unknown>)[prop as string]
  },
})
