import axios from "axios";
import { ToyModel } from "../models/toy.model";

const client = axios.create({
    baseURL: 'https://toy.pequla.com/api',
    headers: {
        'Accept': 'application/json',
        'X-Name': 'Andrija Ilic'
    }
})

export class ToyService {
    static async getAllToys(): Promise<ToyModel[]> {
        const rsp = await client.get<ToyModel[]>('/toy');
        return rsp.data;
    }

    static async getToyByPermalink(permalink: string) {
        return client.get<ToyModel>(`/toy/permalink/${permalink}`);
    }

    static searchToys(toys: ToyModel[], query: string): ToyModel[] {
        const q = query.toLowerCase();
        return toys.filter(toy =>
            toy.name.toLowerCase().includes(q) ||
            toy.type?.name.toLowerCase().includes(q) ||
            toy.ageGroup?.name.toLowerCase().includes(q)
        );
    }
}
