import { loadItems, saveItem } from "$lib/storage";
import fetch from "node-fetch";
import type { AmazonItem } from "$lib/types";
import { sendEmail } from "$lib/email";

const collectionName = "amazon-item-tracker";

export async function handler() {
    const items = await loadItems<AmazonItem>(collectionName);

    const itemDetails = await Promise.all(items.map(async (item) => {
        const response = await fetch(`https://www.amazon.com/dp/${item.id}`);
        return {
            item,
            pageText: await response.text()
        };
    }));

    const availableItems = [];
    const savePromises = [];

    for (const {item, pageText} of itemDetails) {
        const instock = pageText.search(/Currently unavailable/) === -1;

        // Only send a message on initial product availability
        if (instock && !item.instock) {
            availableItems.push(item);
        }

        item.instock = instock;

        savePromises.push(saveItem(collectionName, item));
    }

    await Promise.all([
        sendEmail(availableItems),
        ...savePromises
    ]);
}
