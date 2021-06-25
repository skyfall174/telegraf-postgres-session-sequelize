import { getSessionTable, ModelSettings } from './model'
import { Context, MiddlewareFn } from 'telegraf'
import { Sequelize } from 'sequelize'

function getSessionKey(ctx: Context<any>): string {
  let chatInstance
  if (ctx.chat) {
    chatInstance = ctx.chat.id
  } else if (ctx.updateType === 'callback_query') {
    chatInstance = ctx.callbackQuery.chat_instance
  } else {
    // if (ctx.updateType === 'inline_query') {
    chatInstance = ctx.from.id
  }
  return chatInstance + ':' + ctx.from.id
}

export interface SessionSettings {
  modelsSettings: ModelSettings
  sequelizeInstance: Sequelize
}

export type SessionOptions = {
  sessionName: string
  collectionName: string
  sessionKeyFn: (ctx: Context<any>) => string
}

export const Session = <C extends Context = Context>(
  sequelize: Sequelize,
  sessionOptions?: Partial<SessionOptions>
): MiddlewareFn<C> => {
  const options: SessionOptions = {
    sessionName: 'session',
    collectionName: 'sessions',
    sessionKeyFn: getSessionKey,
    ...sessionOptions
  }

  const collection = getSessionTable(sequelize)

  const saveSession = (key: string, data: any) =>
    collection.upsert({
      data: JSON.stringify(data),
      id: key
    })
  const getSession = async (key: string) => {
    try {
      const data = await collection.findByPk(key, { rejectOnEmpty: true })
      return JSON.parse(data.data)
    } catch (e) {
      return {}
    }
  }

  const { sessionKeyFn: getKey, sessionName } = options

  return async (ctx: Context, next) => {
    const key = getKey(ctx)
    const data = key == null ? undefined : await getSession(key)

    // @ts-ignore
    ctx[sessionName] = data

    await next()

    // @ts-ignore
    if (ctx[sessionName] != null) {
      // @ts-ignore
      await saveSession(key, ctx[sessionName])
    }
  }
}
