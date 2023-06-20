import { MessageLapinou, handleTopic, initExchange, initQueue, publishTopic, receiveResponses, sendMessage } from "../services/lapinouService";
import Order from "../models/order";
import { v4 as uuidv4 } from 'uuid';

export function createMainExchange() {
    initExchange('orders').then(exchange => {
        initQueue(exchange, 'create.order').then(({queue, topic}) => {
            handleTopic(queue, topic, async (msg) => {
                const message = msg.content as MessageLapinou;
                try {
                console.log(` [x] Received message: ${JSON.stringify(message)}`);

                const replyQueue = 'collect.restorer.kitty.reply';
                const correlationId = uuidv4();
                const paymentMessage: MessageLapinou = {
                    success: true,
                    content: {
                        id: message.content._idIdentity,
                        amount: message.content.amount,
                        mode: message.content.mode,
                        correlationId: correlationId,
                        replyTo: replyQueue
                    }
                }
                await publishTopic('users', 'create.payment', paymentMessage);
                const responses = await receiveResponses(replyQueue, correlationId, 1);
                if(responses.length === 0 || !responses[0].success) {
                    throw new Error('Payment failed');
                }

                const order = new Order({
                    _idMenus: message.content._idMenus,
                    _idIdentity: message.content._idIdentity,
                    _idPayment: responses[0].content.id,
                    amount: message.content.amount,
                    withCommissionAmount: message.content.amount + process.env.CESIEAT_COMMISSION,
                    deliveryAmount: process.env.DELIVERYMAN_COMMISSION,
                });
                await order.save();
                
                const orderMessage: MessageLapinou = {
                    success: true,
                    content: order
                }
                await publishTopic('orders', 'created.order', orderMessage);

                await sendMessage({success: true, content: null, correlationId: message.correlationId, sender: 'order'}, message.replyTo??'');
                } catch (err) {
                    const errMessage = err instanceof Error ? err.message : 'An error occurred';
                    await sendMessage({success: false, content: errMessage, correlationId: message.correlationId, sender: 'payment'}, message.replyTo??'');
                }
            });
        });
    });
}