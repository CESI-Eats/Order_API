import {handleTopic, initExchange, initQueue, MessageLapinou, sendMessage} from "../services/lapinouService";
import Order from "../models/order";

export function getHistoricExchange() {
    initExchange('historic').then(exchange => {
        initQueue(exchange, 'get.orders.for.user').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);
                    const orders = await Order.find({_idUser: message.content.id}).lean();

                    await sendMessage(
                        {
                            success: true,
                            content: orders,
                            correlationId: message.correlationId,
                            sender: 'order',
                        },
                        message.replyTo ?? ''
                    );
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage(
                        {
                            success: false,
                            content: errMessage,
                            correlationId: message.correlationId,
                            sender: 'order',
                        },
                        message.replyTo ?? ''
                    );
                }
            });
        });

        initQueue(exchange, 'get.orders.for.deliveryman').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);

                    const orders = await Order.find({_idDeliveryman: message.content.id}).lean();

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

        initQueue(exchange, 'get.orders.for.restorer').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                    console.log(` [x] Received message: ${JSON.stringify(message)}`);

                    const orders = await Order.find({_idRestorer: message.content.id}).lean();

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