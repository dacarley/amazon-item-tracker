import { SESv2 } from "@aws-sdk/client-sesv2";
import type { AmazonItem } from "./types";

const ses = new SESv2({});

export async function sendEmail(items: AmazonItem[]) {
    await ses.sendEmail({
        FromEmailAddress: "dacarley@gmail.com",
        Destination: {
            ToAddresses: ["dacarley@gmail.com"]
        },
        Content: {
            Simple: {
                Body: {
                    Html: {
                        Data: [
                            "<html>",
                            "<body>",
                            "<h1>Hello from the AmazonItemTracker!</h1>",
                            "",
                            ...items.map(item => `<a href='${getItemUrl(item)}'>${item.name}</a> is back in stock!`),
                            "</body>",
                            "</html>"
                        ].join("\n")
                    }
                },
                Subject: {
                    Data: `There are ${items.length} item(s) back in stock!`,
                }
            }
        }
    });
}

function getItemUrl(item: AmazonItem) {
    return `https://smile.amazon.com/dp/${item.id}`;
}
