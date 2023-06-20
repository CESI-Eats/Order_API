import { connectLapinou } from './services/lapinouService';
import { createMainExchange } from './exchanges/mainExchange';

export function initLapinou(){
    connectLapinou().then(async () => {
      createMainExchange();
    }).catch((err) => {
        console.error('Failed to connect to rabbitMQ');
    });
}
