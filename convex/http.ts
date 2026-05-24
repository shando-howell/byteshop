import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
    path: "/clerk",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const payloadString = await req.text();
        const headerPayload = req.headers;

        try {
            // Retrieve secret from Convex dashboard environment variables
            const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
            if (!webhookSecret) {
                throw new Error("Missing CLERK_WEBHOOK_SECRET");
            }

            const svixHeaders = {
                "svix-id": headerPayload.get("svix-id")!,
                "svix-timestamp": headerPayload.get("svix-timestamp")!,
                "svix-signature": headerPayload.get("svix-signature")!
            };

            const wh = new Webhook(webhookSecret);
            // eslint-disable-next-line
            const event = wh.verify(payloadString, svixHeaders) as any;

            // Handle the specific event type
            if (event.type === "user.created" || event.type === "user.updated") {
                const { id, email_addresses, first_name, last_name } = event.data;
                const primaryEmail = email_addresses[0]?.email_address;
                const name = [first_name, last_name].filter(Boolean).join(" ");

                await ctx.runMutation(internal.users.createUser, {
                    clerkId: id,
                    email: primaryEmail,
                    name: name || undefined,
                });
            }

            return new Response(null, { status: 200 });
        } catch (error) {
            console.error("Webhook Verification Failed", error);
            return new Response("Wbhook Error", { status: 400 });
        }
    }),
});

export default http;