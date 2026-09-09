import { Redis } from "@upstash/redis";

const kv = Redis.fromEnv();
const orderKey = (id) => `order:${id}`;

export async function saveOrder(order) {
  await kv.set(orderKey(order.id), order);
  return order;
}

export async function getOrder(id) {
  if (!id) return null;
  return kv.get(orderKey(String(id)));
}
