import { defineConfig } from 'astro/config'
import * as fs from 'node:fs'

import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import optimizer from 'vite-plugin-optimizer'

export default defineConfig({
    integrations: [react(), tailwind({ applyBaseStyles: false })],
    vite: {
        server: process.env.MODE === 'development' ? {
            https: {
                cert: fs.readFileSync('./.local-ssl/localhost.pem'),
                key: fs.readFileSync('./.local-ssl/localhost-key.pem')
            },
        } : {},
        build: {
            minify: false
        },
        resolve: {
            dedupe: ['@lumeweb/libportal', '@lumeweb/libweb', '@lumeweb/libkernel']
        },
        plugins: [
            optimizer({
                'node-fetch':
                    'const e = undefined; export default e;export {e as Response, e as FormData, e as Blob};'
            })
        ]
    }
})
