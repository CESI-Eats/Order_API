import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";
import Order from "../models/order";
import { v4 as uuidv4 } from 'uuid';

export function createOrderingExchange() {
    initExchange('ordering').then(exchange => {
        initQueue(exchange, 'create.order').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);

                const paymentReplyQueue = 'create.payment.reply';
                const paymentCorrelationId = uuidv4();
                const paymentMessage: MessageLapinou = {
                    success: true,
                    content: {
                        id: message.content._idIdentity,
                        amount: message.content.amount,
                        mode: message.content.mode
                    },
                    correlationId: paymentCorrelationId,
                    replyTo: paymentReplyQueue
                }
                await publishTopic('ordering', 'create.payment', paymentMessage);
                const responses = await receiveResponses(paymentReplyQueue, paymentCorrelationId, 1);
                if(responses.length === 0 || !responses[0].success) {
                    throw new Error('Payment failed');
                }

                const order = new Order({
                    _idMenus: message.content._idMenus,
                    _idUser: message.content._idIdentity,
                    _idPayment: responses[0].content.id,
                    _idRestorer: message.content._idRestorer,
                    _idDeliveryman: null,
                    amount: message.content.amount,
                    withCommissionAmount: message.content.amount + process.env.CESIEAT_COMMISSION,
                    deliveryAmount: process.env.DELIVERYMAN_COMMISSION,
                });
                await order.save();
                
                const orderMessage: MessageLapinou = {
                    success: true,
                    content: order
                }
                await publishTopic('ordering', 'order.submitted', orderMessage);

                await sendMessage({success: true, content: null, correlationId: message.correlationId, sender: 'order'}, message.replyTo??'');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'order'}, message.replyTo??'');
                }
            });
        });
        initQueue(exchange, 'assigned.deliveryman.order').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);
                await Order.findOneAndUpdate({_id: message.content._idOrder}, {_idDeliveryman: message.content.deliveryMan.id, status: 'assigned'});
                console.log(`Order assigned to deliveryman`);

                const socketMessage: MessageLapinou = {
                    success: true,
                    content: {
                        topic: 'order.assigned',
                        message: 'assigned',
                        ids: [message.content._idUser, message.content.deliveryMan.id]
                    }
                };

                await publishTopic('notifications', 'send.websocket', socketMessage);

                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    console.error(errMessage);
                }
            });
        });
        initQueue(exchange, 'update.order.status').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);
                const order = await Order.findOneAndUpdate({_id: message.content.orderId}, {status: message.content.status});
                if(!order) {
                    throw new Error('Order not found');
                }
                console.log(`Order status updated : ${message.content.status}`);

                const socketMessage: MessageLapinou = {
                    success: true,
                    content: {
                        topic: `order.${message.content.status}`,
                        message: message.content.status,
                        ids: [order._idUser, order._idDeliveryman]
                    }
                };

                await publishTopic('notifications', 'send.websocket', socketMessage);

                await sendMessage({success: true, content: null, correlationId: message.correlationId, sender: 'order'}, message.replyTo??'');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'order'}, message.replyTo??'');
                }
            });
        });
    });
}