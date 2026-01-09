import { ToyType } from "./toy.model"

export interface OrderModel {
    description: string
    type: string | ToyType;
    age: string
    group: string
    orderId: string
    toyId: number
    toyName: string
    price: number
    quantity: number
    status: 'na' | 'paid' | 'canceled' | 'liked' | 'disliked'
}