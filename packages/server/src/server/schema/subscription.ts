import { NotificationType, Prisma } from '@prisma/client'
import { isEqual, partition, pick } from 'lodash'
import { arg, booleanArg, inputObjectType, list, mutationField, objectType, queryField, stringArg } from 'nexus'
import { NotificationType as GQLNotificationType, Subscription } from 'nexus-prisma'

import { Context } from '@/server/context'
import { authMemberId } from '@/server/utils/token'

export const SubscriptionFields = objectType({
  name: Subscription.$name,
  description: Subscription.$description,
  definition(t) {
    t.field(Subscription.id)
    t.field(Subscription.notificationType)
    t.field(Subscription.entityIds)
    t.field(Subscription.shouldNotify)
    t.field(Subscription.shouldNotifyByEmail)
  },
})

export const subscriptionsQuery = queryField('subscriptions', {
  type: list(Subscription.$name),
  args: {
    notificationType: arg({ type: GQLNotificationType.name }),
    entityIds: stringArg(),
    shouldNotify: booleanArg(),
    shouldNotifyByEmail: booleanArg(),
  },
  resolve: async (_, args, { prisma, req }: Context) => {
    const memberId = authMemberId(req)
    if (!memberId) return null

    return prisma.subscription.findMany({ where: { ...args, memberId } })
  },
})

interface SubscriptionInput {
  notificationType: NotificationType
  entityIds?: string[]
  shouldNotify?: boolean
  shouldNotifyByEmail?: boolean
}
const subscriptionsInput = inputObjectType({
  name: 'SubscriptionInput',
  definition(t) {
    t.nonNull.field(Subscription.notificationType)
    t.nullable.list.string(Subscription.entityIds.name)
    t.boolean(Subscription.shouldNotify.name)
    t.boolean(Subscription.shouldNotifyByEmail.name)
  },
})

interface SubscriptionsMutationInput {
  data: SubscriptionInput[]
}
export const subscriptionsMutation = mutationField('subscriptions', {
  type: list(Subscription.$name),
  args: { data: list(subscriptionsInput) },
  resolve: async (_, { data }: SubscriptionsMutationInput, { prisma, req }: Context) => {
    const memberId = authMemberId(req)
    if (!memberId) return null

    const currents = await prisma.subscription.findMany({ where: { memberId } })
    const [toUpdate, toDelete] = partition(currents, (a) => data.some((b) => b.notificationType === a.notificationType))
    const upserts = data.flatMap<Prisma.SubscriptionUpsertArgs>((input) => {
      const current = toUpdate.find((sub) => sub.notificationType === input.notificationType)
      const noChangeNeeded =
        current &&
        (current.shouldNotify === input.shouldNotify ?? true) &&
        (current.shouldNotifyByEmail === input.shouldNotifyByEmail ?? true) &&
        isEqual(current.entityIds, input.entityIds)

      if (noChangeNeeded) return []

      const where = current ? { id: current.id } : { memberId, notificationType: input.notificationType }
      const update = pick(input, 'entityIds', 'shouldNotify', 'shouldNotifyByEmail')
      return { where, update, create: { ...input, memberId } }
    })

    const deleteIds = toDelete.map(({ id }) => id)

    await prisma.$transaction([
      ...upserts.map((args) => prisma.subscription.upsert(args)),
      prisma.subscription.deleteMany({ where: { id: { in: deleteIds } } }),
    ])

    return await prisma.subscription.findMany({ where: { memberId } })
  },
})
