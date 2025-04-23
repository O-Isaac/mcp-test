import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod"
import { Resend } from "resend";
import { textToSpeech } from "./utils";

const server = new McpServer({ name: "atlascademy-mcp", version: "1.0.0" });
const resend = new Resend(process.env.RESEND_API_KEY)

server.tool(
    "fetch-servant-by-id",
    "Fetch servants details from given id",
    {
        id: z.number().describe("unique id of servant called svtid")
    },
    async ({ id }) => {
        const request = await fetch(`https://api.atlasacademy.io/nice/JP/servant/${id}?lang=en`)
        
        if (!request.ok) {
            return {
                content: [
                    {
                        type: "text",
                        data: `Requests Error: Status Code ${request.status}`
                    }
                ]
            }
        }
        
        const response = await request.json();

        return {
            content: [
                { 
                    type: "text",
                    text: JSON.stringify(response, null, 2)    
                }
            ]
        }
    }
)

server.tool(
    "fetch-servant-by-name",
    "Fetch multiple servants give by name",
    {
        name: z.string().describe("Name of the servant you want search")
    },
    async ({ name }) => {
        const request = await fetch(`https://api.atlasacademy.io/nice/JP/servant/search?name=${name}&lang=en`)
        
        if (!request.ok) {
            return {
                content: [
                    {
                        type: "text",
                        data: `Requests Error: Status Code ${request.status}`
                    }
                ]
            }
        }
        
        const servants = await request.json();
        
        return {
            content: servants.map((servant) => {
                return {
                    type: "text",
                    text: JSON.stringify(servant, null, 2)
                }
            })
        }
    }
)

server.tool(
    "send-email",
    "Send servant info prompted in to my email",
    {
        subject: z.string().describe("subject of the message you want send"),
        body: z.string().describe("message you want send in html")
    },
    async ({ body, subject }) => {
        // Here you can use nodemailer instead resend, i use for testing propurse
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'zaragozamendozaisaac@outlook.es',
            subject: subject,
            html: body
        });

        if (error) {
            return {
                content: [
                    {
                        type: "text",
                        data: `Error: ${error.message}`
                    }
                ]
            }
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Message ${data?.id} send successfully.`
                }
            ] 
        }
    }
)


server.tool(
    "speech",
    "Make ia speech or talk",
    {
        message: z.string().describe("Message you want talk the ia")
    },
    async ({ message }) => {
        const data = await textToSpeech(message)

        return {
            content: [
                {
                    type: "resource",
                    resource: {
                        "uri": data,
                        "mimeType": "audio/mpeg",
                        "text": "Resource content"
                    }
                }
            ]
        }
    }
)

const transport = new StdioServerTransport();
server.connect(transport)