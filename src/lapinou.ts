import {connectLapinou} from './services/lapinouService';
import {createOrderingExchange} from './exchanges/orderingExchange';
import {createOrderExchange} from './exchanges/orderExchange';
import {getHistoricExchange} from "./exchanges/historicExchange";

export function initLapinou() {
    connectLapinou().then(async () => {
        createOrderingExchange();
        createOrderExchange();
        getHistoricExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
