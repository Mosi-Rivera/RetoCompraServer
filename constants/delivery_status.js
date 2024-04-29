const obj = {
    PENDING: "pending",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    FAILED_DELIVERY: "failed_delivery",
    CANCELLED: "cancelled",
    RETURNED: "returned"
};
const arr = Object.values(obj);
module.exports.obj = obj;
module.exports.arr = arr;
