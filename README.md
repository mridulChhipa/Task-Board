# Task Board

## Installing nodeJs on WSL2 / Linux
```
# Docker has specific installation instructions for each operating system.
# Please refer to the official documentation at https://docker.com/get-started/

# Pull the Node.js Docker image:
docker pull node:24-alpine

# Create a Node.js container and start a Shell session:
docker run -it --rm --entrypoint sh node:24-alpine

# Verify the Node.js version:
node -v # Should print "v24.13.0".

# Verify npm version:
npm -v # Should print "11.6.2".
```

## Mounting files from docker to Windows
- To run the container with mapping the ports and mounting the files:  `docker run -p 5173:5173 -it -v "/mnt/d/mridul/courses/cop290/Task Board:/app" --rm  --entrypoint sh node:24-alpine`
- Move to the frontend directory: cd task-board-frontend
- To run the app: `npm run dev -- --host`

- Auto reload fix: 
    ```
    # vite.config.js

    export default defineConfig({
    plugins: [react()],
    server: {
        watch: {
        usePolling: true,
        interval: 100
        },
        host: true,
        strictPort: true,
        port: 5173
    }
    })
    ```
    