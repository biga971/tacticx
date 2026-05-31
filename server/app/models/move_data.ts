import { MoveDataSchema } from '#database/schema'

export type MoveCategory = 'physical' | 'special' | 'status'

export default class MoveData extends MoveDataSchema {}
