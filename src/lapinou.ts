import { connectLapinou } from './services/lapinouService';
import { createOrderingExchange } from './exchanges/orderingExchange';
import { createOrderExchange } from './exchanges/orderExchange';

export function initLapinou(){
    connectLapinou().then(async () => {
      createOrderingExchange();
      createOrderExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
