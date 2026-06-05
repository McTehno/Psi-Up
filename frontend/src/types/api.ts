export type ErrorDetail = {
  code: string
  message: string
  details?: unknown | null
}

export type ErrorResponse = {
  success: false
  error: ErrorDetail
}

