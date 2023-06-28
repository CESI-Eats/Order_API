import {connectLapinou} from './services/lapinouService';
import {createOrderingExchange} from './exchanges/orderingExchange';
import {createOrderExchange} from './exchanges/orderExchange';
import {getHistoricExchange} from "./exchanges/historicExchange";

export function initLapinou() {
    connectLapinou().then(async () => {
        createOrderingExchange();
        createOrderExchange();
        getHistoricExchange();
    }).catch((error) => console.log('Failed to connect to Lapinou.', error));
}
