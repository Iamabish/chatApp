import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { username } from "better-auth/plugins"
import prisma from "./db.js"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),

    
    databaseHooks : {
        user : {
            create : {
                before : async (user) => {
                    const base = user.name
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .replace(/[^a-z0-9]/g, "")

                    const sufix = Math.floor(Math.random() * 10000)

                    return {
                        data : {
                            ...user,
                            userName : `${base}${sufix}`
                        }
                    }
                }
            }
        }
    },
    
    emailAndPassword :{
        enabled : true
    },

    socialProviders: {
        google: { 
            prompt : "select_account consent",
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType : 'offline',
        },  
    },

    basePath : "/api/auth",
    experimental : {joins : true},
    
    baseURL: process.env.BETTER_AUTH_URL as string,

    trustedOrigins: [
        "https://chatup-gfmk.onrender.com",
        "http://localhost:5173",
    ],

    advanced: {
        defaultCookieAttributes: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        }
    }

    

    
    
})