import { connectLapinou } from './services/lapinouService';
import { createOrderingExchange } from './exchanges/orderingExchange';

export function initLapinou(){
    connectLapinou().then(async () => {
      createOrderingExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
