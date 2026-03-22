# Task Board

## 1. Setup
- Follow the given instruction separately for backend:
  1. `cd backend`
  2. `npm install`
  3. `npx prisma init --datasource-provider postgresql --output ../generated/prisma`
      - This will generate some files and .env 
      - update the .env file [PORT=3000, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DATABASE_URL]
  4. `npx prisma migrate reset`
  5. `npx prisma migrate dev`
  6. `npx prisma generate`
  7. `npm run dev`
  8. `cd .. && cd frontend`
  9. `npm install`
  10. 

## 2. Running the server
- The server resided in the backend
  1. `cd backend`
  2. `npm run dev` -> this runs the server

- Below are some useful commands 
  - `npm run test`-> this runs tests
  - `npm run format` -> applies prettier
  - `npm run lint` -> return a lint check

## Rigourous Testing Requirements
- Checking about audit trail and story status consistencies
- Manual setting of status consistency
- Implementing guards
- Resolved and closed timestamp also need to be implemented (mp update function mein unko bhi include krna padega i.e. the TaskBody and send sirf frontend ke through hoga).
