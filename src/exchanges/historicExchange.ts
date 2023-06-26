import {handleTopic, initExchange, initQueue, MessageLapinou, sendMessage} from "../services/lapinouService";
import Order from "../models/order";

export function getHistoricExchange() {
    initExchange('historic').then(exchange => {
        initQueue(exchange, 'get.orders.for.deliveryman').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const orders = await Order.find(Order, {
                        where: {_idDeliveryman: message.content.id}
                    });

                    console.log(`Orders retrieved : ${orders}`);
                    if (orders.length === 0) {
                        throw new Error('Orders not found');
                    }

                    await sendMessage({
                        success: true,
                        content: orders,
                        correlationId: message.correlationId,
                        sender: 'order'
                    }, message.replyTo ?? '');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({
                        success: false,
                        content: errMessage,
                        correlationId: message.correlationId,
                        sender: 'order'
                    }, message.replyTo ?? '');
                }
            });
        });
    });
}