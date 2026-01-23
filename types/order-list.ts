export type Order = {
    id: string
    stripe_session_id: string
    customer_email: string | null
    amount_total: number
    status: string
    created_at: string
    customer_name: string
}