export type ResponseWithOptionalIds = {
  id?: string
  _id?: string
}

export function getResponseId(
  item: ResponseWithOptionalIds,
  fallback = ''
): string {
  return item.id ?? item._id ?? fallback
}

