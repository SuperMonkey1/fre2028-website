// Short code that identifies a Tailr Edge order on the printed part (engraved in the face that lies on the bed) and
// on /admin/tailr-edge: the first four letters/digits of the order id, in capitals.
export const orderCode = (orderId: string) => orderId.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
