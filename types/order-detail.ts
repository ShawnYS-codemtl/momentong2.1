export type OrderItem = {
    name: string
    quantity: number
    price: number | null
}
  
export type ShippingAddress = {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
}

export type OrderDetail = {
    id: string
    stripe_session_id: string
    customer_name: string
    customer_email: string | null
    amount_total: number
    status: string
    items: OrderItem[]
    shipping_address: ShippingAddress | null
    created_at: string
}
  