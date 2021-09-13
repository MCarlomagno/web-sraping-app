import axios from 'axios';
import { ItemData } from '../models/item-data.model';

export class ApiService {

    // TODO transform to env variable.
    apiURL = 'http://localhost:8080/clothing-item/many';

    async uploadItems(data: ItemData[]) {
        return axios.post(this.apiURL, data);
    }

}